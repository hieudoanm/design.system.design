# OpenTable — Restaurant Reservation

Design a restaurant reservation system

**Difficulty:** Medium

**Tags:** booking, search

## Functional Requirements

- a restaurant reservation system
- model table availability and seat assignment?
- handle no-shows and overbooking?
- distribute reservations across restaurants?
- handle the waitlist and real-time updates?

## Non-Functional Requirements

- The system is a two-sided product: diners search and book tables, while
  restaurants manage capacity.

- I would structure it as a gateway in front of restaurant search, table
  availability, reservation, and waitlist services, with a Notifications service
  and a Reservations DB.
- Search indexes restaurants by cuisine, location, and rating.
- The availability engine holds per-restaurant table capacity by time slot.
- The reservation service runs the booking state machine.
- The waitlist captures overflow demand.
- Party size, table configuration, and meal periods vary per restaurant, so the
  table model must be flexible rather than a fixed schema.

The request flow runs end to end through these components:

- Diners browse through the app; search returns matches, and the availability
  engine checks open tables for the requested party size and time.
- Confirming a reservation writes to the Reservations DB, publishes a
  confirmation via notifications, and decrements capacity.
- Restaurants manage their own supply through a portal that updates tables and
  opening hours, so the system never hardcodes a restaurant's layout (each
  restaurant publishes its own table model).
- Walk-ins, reservations with no credit card, and special requests like outdoor
  seating all feed the same capacity model, keeping one source of truth.

The interesting scaling property is that demand is spiky around dinner times and
geographies:

- Sharding the Reservations DB by city or metro keeps each restaurant's data and
  its hot slots local to one shard, and the availability cache absorbs read
  amplification from search.
- The tradeoff is consistency between the portal's edits and diner-facing
  availability, handled by treating the restaurant's configuration as the source
  of truth and propagating changes as events.
- Analytics over historical fill rates let the system suggest table settings to
  restaurants..
- No-shows are a genuine inventory leak, and overbooking is the standard
  countermeasure, but it must be done with a soft landing.

- I would track each restaurant's historical no-show rate by party size, day of
  week, and lead time, then allow the availability engine to oversell a bounded
  percentage of capacity, similar to airline yield management.
- The oversell factor is capped per restaurant and time slot so that realized
  occupancy never exceeds physically available tables plus a safety margin.
- Credit-card-backed reservations reduce no-shows for premium tables and give
  the platform a recovery mechanism, so I would layer them on top of the base
  policy.

When a party that was booked beyond physical capacity shows up, the restaurant
needs options rather than an impossible promise.

- The system flags at-risk bookings, lets the host seat them at a table released
  by an earlier no-show, and otherwise offers a guaranteed waitlist position or
  a credit.
- Notifications and the restaurant portal surface these situations before the
  diner arrives, so compensation is proactive rather than reactive.
- Reservations held on card are charged a modest fee only after a documented
  no-show, with a dispute path.

Mechanically, the reservation state machine needs statuses beyond confirmed:
checked-in, no-show, seated, and cancelled.

- A no-show is recorded automatically if a reservation is not checked in within
  a grace window, feeding the no-show model and freeing capacity for waitlisted
  parties.
- The core tradeoff is that overbooking maximizes revenue but taxes goodwill;
  the model must therefore be tuned from real data and reviewed frequently, with
  per-restaurant controls on the ceiling.
- The whole lifecycle is logged so restaurants can see exactly how overbooking
  converted into revenue or compensation..
- Distribution is about routing demand to supply: the search experience must
  surface restaurants that can actually seat the party, and the back-end must
  handle the fact that reservations are extremely concentrated in a few cities and
  meal windows.

- I would shard by metro area, since a diner searches within their city and
  cross-city booking is rare.
- Search and availability are read-heavy, so each shard runs replicas and a
  local cache of slot availability.
- The shard also keeps the restaurant's portal traffic local, so a restaurant
  editing its floor plan during dinner rush only affects its own shard.

Within a metro, the availability engine precomputes a compact summary of open
slots per restaurant for the next few days, updated on a short cycle.

- Search reads this summary so it can filter and rank only restaurants that are
  genuinely bookable, avoiding the poor experience of sending a diner to a
  restaurant with no open slot.
- The summary also powers demand insights, letting the platform nudge
  restaurants with flexible hours or recommend alternative cuisines when a
  search is over-subscribed.
- Confirmation of a booking happens against the shard-local availability engine,
  so the search summary never needs to be perfectly synchronized with the
  reservation database.

The main tradeoff is regional isolation versus global features like cross-market
ranking or a unified waitlist.

- I would accept regional isolation because it buys simpler transactions and
  lower latency, and run global reporting as an offline job over shard exports.
- Load spikes at holidays are absorbed by scaling the affected metro's replicas
  and cache nodes independently, so a surge in one city does not consume another
  city's resources..
- The waitlist exists because popular restaurants sell out, and it converts
  overflow demand into guaranteed future or same-day seats.

- I would model the waitlist as a priority queue per restaurant and date,
  ordered by join time with an optional party-size constraint.
- When a slot opens (through a cancellation or a no-show), the waitlist service
  notifies the next eligible party and holds the slot for a short confirm
  window, then releases it if the party declines.
- Same-day waitlists use join time as priority, while future-date waitlists can
  also be filtered by the party's preferred window to avoid noisy notifications.

Real-time updates flow over WebSockets or server-sent events through the
notification service.

- A diner on the waitlist sees their position move as earlier parties are
  seated, and the host sees the queue live in the portal.
- Position is computed from the persistent queue, not from broadcast deltas, so
  reconnecting clients always converge to the same number; broadcasts only push
  deltas to keep client-side state cheap.
- Rate limits on notifications prevent a spike of slot opens from hammering the
  messaging pipeline, batching by restaurant.

The queue must survive partial failures: notifying a party is a saga where the
slot is held transactionally, the notification is queued, and a timeout releases
the hold.

- Redis provides the fast in-memory queue while the Reservations DB remains the
  durable record, so restarts do not lose positions.
- The design tradeoff is latency against strictness; eventual position updates
  are fine as long as the final offer is atomic.
- Analytics over conversion rates (offers accepted versus declined) let
  restaurants tune party-size and wait-time thresholds.

## Source

````text
title: Restaurant Reservation
node diner: Diner [round, icon=browser]
node app: Booking App [icon=browser]
node gateway: API Gateway [icon=server]
node search: Restaurant Search [icon=search]
node avail: Table Availability [icon=cache]
node booking: Reservation Service [icon=compute]
node waitlist: Waitlist [icon=queue]
node notify: Notifications [icon=message]
node restaurant: Restaurant Portal [icon=browser]
node db: Reservations DB [cylinder, icon=database]

edge diner -> app: find restaurant
edge app -> gateway: query
edge gateway -> search: matches
edge gateway -> avail: check tables
edge avail -> booking: reserve
edge booking -> db: store
edge booking -> notify: confirm
edge diner -> waitlist: join
edge waitlist -> notify: slot open
edge restaurant -> avail: update tables
edge restaurant -> booking: manage
edge avail -> search: capacity
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Restaurant Reservation
diner: Diner
app: Booking App
gateway: API Gateway
search: Restaurant Search
avail: Table Availability
booking: Reservation Service
waitlist: Waitlist
notify: Notifications
restaurant: Restaurant Portal
db: Reservations DB

diner ─► app ─► find restaurant
app ─► gateway ─► query
gateway ─► search ─► matches
gateway ─► avail ─► check tables
avail ─► booking ─► reserve
booking ─► db ─► store
booking ─► notify ─► confirm
diner ─► waitlist ─► join
waitlist ─► notify ─► slot open
restaurant ─► avail ─► update tables
restaurant ─► booking ─► manage
avail ─► search ─► capacity
````

## Design

### Design a restaurant reservation system

The system is a two-sided product: diners search and book tables, while
restaurants manage capacity.

- I would structure it as a gateway in front of restaurant search, table
  availability, reservation, and waitlist services, with a Notifications service
  and a Reservations DB.
- Search indexes restaurants by cuisine, location, and rating.
- The availability engine holds per-restaurant table capacity by time slot.
- The reservation service runs the booking state machine.
- The waitlist captures overflow demand.
- Party size, table configuration, and meal periods vary per restaurant, so the
  table model must be flexible rather than a fixed schema.

The request flow runs end to end through these components:

- Diners browse through the app; search returns matches, and the availability
  engine checks open tables for the requested party size and time.
- Confirming a reservation writes to the Reservations DB, publishes a
  confirmation via notifications, and decrements capacity.
- Restaurants manage their own supply through a portal that updates tables and
  opening hours, so the system never hardcodes a restaurant's layout (each
  restaurant publishes its own table model).
- Walk-ins, reservations with no credit card, and special requests like outdoor
  seating all feed the same capacity model, keeping one source of truth.

The interesting scaling property is that demand is spiky around dinner times and
geographies:

- Sharding the Reservations DB by city or metro keeps each restaurant's data and
  its hot slots local to one shard, and the availability cache absorbs read
  amplification from search.
- The tradeoff is consistency between the portal's edits and diner-facing
  availability, handled by treating the restaurant's configuration as the source
  of truth and propagating changes as events.
- Analytics over historical fill rates let the system suggest table settings to
  restaurants.

### How do you model table availability and seat assignment?

Table availability is fundamentally a time-interval problem, not a per-table
flag.

- The model treats a restaurant as a set of table records, each with seats and
  physical characteristics, and computes availability over a rolling horizon of
  meal-period slots.
- A reservation for a party of four is satisfied by one four-top or by combining
  two-tops, so the availability engine maintains a per-restaurant bipartite
  mapping of party sizes to table combinations.
- Combinations like tables pushed together are expensive to enumerate, so the
  engine precomputes compatible sets per restaurant and caches them.

Seat assignment is decoupled from the search answer.

- Search only needs to know whether any valid table combination is free; the
  exact assignment is resolved at booking time against a slot-level inventory
  that tracks each table's occupancy across contiguous time slots.
- I would use a slot occupancy table keyed by restaurant, date, and slot,
  updated transactionally so two parties cannot claim the same table interval,
  with a short lock released once the reservation is committed.
- The booking service assigns the specific table at confirm time and holds it in
  the reservation record for the restaurant's floor plan.

The tradeoff is granularity.

- Fixed 15- or 30-minute slots are easy to index and cache, but ignore realistic
  dining durations; modeling variable durations complicates search.
- I would store standard durations per meal period and allow restaurants to
  override, then let the availability engine enforce the reservation window
  against those durations.
- Walk-in capacity is reserved explicitly so the model does not silently
  overcommit.
- When a restaurant edits its floor plan, open reservations keep their assigned
  tables and only new bookings see the change.

### How do you handle no-shows and overbooking?

No-shows are a genuine inventory leak, and overbooking is the standard
countermeasure, but it must be done with a soft landing.

- I would track each restaurant's historical no-show rate by party size, day of
  week, and lead time, then allow the availability engine to oversell a bounded
  percentage of capacity, similar to airline yield management.
- The oversell factor is capped per restaurant and time slot so that realized
  occupancy never exceeds physically available tables plus a safety margin.
- Credit-card-backed reservations reduce no-shows for premium tables and give
  the platform a recovery mechanism, so I would layer them on top of the base
  policy.

When a party that was booked beyond physical capacity shows up, the restaurant
needs options rather than an impossible promise.

- The system flags at-risk bookings, lets the host seat them at a table released
  by an earlier no-show, and otherwise offers a guaranteed waitlist position or
  a credit.
- Notifications and the restaurant portal surface these situations before the
  diner arrives, so compensation is proactive rather than reactive.
- Reservations held on card are charged a modest fee only after a documented
  no-show, with a dispute path.

Mechanically, the reservation state machine needs statuses beyond confirmed:
checked-in, no-show, seated, and cancelled.

- A no-show is recorded automatically if a reservation is not checked in within
  a grace window, feeding the no-show model and freeing capacity for waitlisted
  parties.
- The core tradeoff is that overbooking maximizes revenue but taxes goodwill;
  the model must therefore be tuned from real data and reviewed frequently, with
  per-restaurant controls on the ceiling.
- The whole lifecycle is logged so restaurants can see exactly how overbooking
  converted into revenue or compensation.

### How do you distribute reservations across restaurants?

Distribution is about routing demand to supply: the search experience must
surface restaurants that can actually seat the party, and the back-end must
handle the fact that reservations are extremely concentrated in a few cities and
meal windows.

- I would shard by metro area, since a diner searches within their city and
  cross-city booking is rare.
- Search and availability are read-heavy, so each shard runs replicas and a
  local cache of slot availability.
- The shard also keeps the restaurant's portal traffic local, so a restaurant
  editing its floor plan during dinner rush only affects its own shard.

Within a metro, the availability engine precomputes a compact summary of open
slots per restaurant for the next few days, updated on a short cycle.

- Search reads this summary so it can filter and rank only restaurants that are
  genuinely bookable, avoiding the poor experience of sending a diner to a
  restaurant with no open slot.
- The summary also powers demand insights, letting the platform nudge
  restaurants with flexible hours or recommend alternative cuisines when a
  search is over-subscribed.
- Confirmation of a booking happens against the shard-local availability engine,
  so the search summary never needs to be perfectly synchronized with the
  reservation database.

The main tradeoff is regional isolation versus global features like cross-market
ranking or a unified waitlist.

- I would accept regional isolation because it buys simpler transactions and
  lower latency, and run global reporting as an offline job over shard exports.
- Load spikes at holidays are absorbed by scaling the affected metro's replicas
  and cache nodes independently, so a surge in one city does not consume another
  city's resources.

### How do you handle the waitlist and real-time updates?

The waitlist exists because popular restaurants sell out, and it converts
overflow demand into guaranteed future or same-day seats.

- I would model the waitlist as a priority queue per restaurant and date,
  ordered by join time with an optional party-size constraint.
- When a slot opens (through a cancellation or a no-show), the waitlist service
  notifies the next eligible party and holds the slot for a short confirm
  window, then releases it if the party declines.
- Same-day waitlists use join time as priority, while future-date waitlists can
  also be filtered by the party's preferred window to avoid noisy notifications.

Real-time updates flow over WebSockets or server-sent events through the
notification service.

- A diner on the waitlist sees their position move as earlier parties are
  seated, and the host sees the queue live in the portal.
- Position is computed from the persistent queue, not from broadcast deltas, so
  reconnecting clients always converge to the same number; broadcasts only push
  deltas to keep client-side state cheap.
- Rate limits on notifications prevent a spike of slot opens from hammering the
  messaging pipeline, batching by restaurant.

The queue must survive partial failures: notifying a party is a saga where the
slot is held transactionally, the notification is queued, and a timeout releases
the hold.

- Redis provides the fast in-memory queue while the Reservations DB remains the
  durable record, so restarts do not lose positions.
- The design tradeoff is latency against strictness; eventual position updates
  are fine as long as the final offer is atomic.
- Analytics over conversion rates (offers accepted versus declined) let
  restaurants tune party-size and wait-time thresholds.

## Source

```text
title: Restaurant Reservation
node diner: Diner [round, icon=browser]
node app: Booking App [icon=browser]
node gateway: API Gateway [icon=server]
node search: Restaurant Search [icon=search]
node avail: Table Availability [icon=cache]
node booking: Reservation Service [icon=compute]
node waitlist: Waitlist [icon=queue]
node notify: Notifications [icon=message]
node restaurant: Restaurant Portal [icon=browser]
node db: Reservations DB [cylinder, icon=database]

edge diner -> app: find restaurant
edge app -> gateway: query
edge gateway -> search: matches
edge gateway -> avail: check tables
edge avail -> booking: reserve
edge booking -> db: store
edge booking -> notify: confirm
edge diner -> waitlist: join
edge waitlist -> notify: slot open
edge restaurant -> avail: update tables
edge restaurant -> booking: manage
edge avail -> search: capacity
```

## Q&A

### Q: Design a restaurant reservation system

**A:** The system is a two-sided product: diners search and book tables, while
restaurants manage capacity.

- I would structure it as a gateway in front of restaurant search, table
  availability, reservation, and waitlist services, with a Notifications service
  and a Reservations DB.
- Search indexes restaurants by cuisine, location, and rating.
- The availability engine holds per-restaurant table capacity by time slot.
- The reservation service runs the booking state machine.
- The waitlist captures overflow demand.
- Party size, table configuration, and meal periods vary per restaurant, so the
  table model must be flexible rather than a fixed schema.

The request flow runs end to end through these components:

- Diners browse through the app; search returns matches, and the availability
  engine checks open tables for the requested party size and time.
- Confirming a reservation writes to the Reservations DB, publishes a
  confirmation via notifications, and decrements capacity.
- Restaurants manage their own supply through a portal that updates tables and
  opening hours, so the system never hardcodes a restaurant's layout (each
  restaurant publishes its own table model).
- Walk-ins, reservations with no credit card, and special requests like outdoor
  seating all feed the same capacity model, keeping one source of truth.

The interesting scaling property is that demand is spiky around dinner times and
geographies:

- Sharding the Reservations DB by city or metro keeps each restaurant's data and
  its hot slots local to one shard, and the availability cache absorbs read
  amplification from search.
- The tradeoff is consistency between the portal's edits and diner-facing
  availability, handled by treating the restaurant's configuration as the source
  of truth and propagating changes as events.
- Analytics over historical fill rates let the system suggest table settings to
  restaurants.

### Q: How do you model table availability and seat assignment?

**A:** Table availability is fundamentally a time-interval problem, not a per-table
flag.

- The model treats a restaurant as a set of table records, each with seats and
  physical characteristics, and computes availability over a rolling horizon of
  meal-period slots.
- A reservation for a party of four is satisfied by one four-top or by combining
  two-tops, so the availability engine maintains a per-restaurant bipartite
  mapping of party sizes to table combinations.
- Combinations like tables pushed together are expensive to enumerate, so the
  engine precomputes compatible sets per restaurant and caches them.

Seat assignment is decoupled from the search answer.

- Search only needs to know whether any valid table combination is free; the
  exact assignment is resolved at booking time against a slot-level inventory
  that tracks each table's occupancy across contiguous time slots.
- I would use a slot occupancy table keyed by restaurant, date, and slot,
  updated transactionally so two parties cannot claim the same table interval,
  with a short lock released once the reservation is committed.
- The booking service assigns the specific table at confirm time and holds it in
  the reservation record for the restaurant's floor plan.

The tradeoff is granularity.

- Fixed 15- or 30-minute slots are easy to index and cache, but ignore realistic
  dining durations; modeling variable durations complicates search.
- I would store standard durations per meal period and allow restaurants to
  override, then let the availability engine enforce the reservation window
  against those durations.
- Walk-in capacity is reserved explicitly so the model does not silently
  overcommit.
- When a restaurant edits its floor plan, open reservations keep their assigned
  tables and only new bookings see the change.

### Q: How do you handle no-shows and overbooking?

**A:** No-shows are a genuine inventory leak, and overbooking is the standard
countermeasure, but it must be done with a soft landing.

- I would track each restaurant's historical no-show rate by party size, day of
  week, and lead time, then allow the availability engine to oversell a bounded
  percentage of capacity, similar to airline yield management.
- The oversell factor is capped per restaurant and time slot so that realized
  occupancy never exceeds physically available tables plus a safety margin.
- Credit-card-backed reservations reduce no-shows for premium tables and give
  the platform a recovery mechanism, so I would layer them on top of the base
  policy.

When a party that was booked beyond physical capacity shows up, the restaurant
needs options rather than an impossible promise.

- The system flags at-risk bookings, lets the host seat them at a table released
  by an earlier no-show, and otherwise offers a guaranteed waitlist position or
  a credit.
- Notifications and the restaurant portal surface these situations before the
  diner arrives, so compensation is proactive rather than reactive.
- Reservations held on card are charged a modest fee only after a documented
  no-show, with a dispute path.

Mechanically, the reservation state machine needs statuses beyond confirmed:
checked-in, no-show, seated, and cancelled.

- A no-show is recorded automatically if a reservation is not checked in within
  a grace window, feeding the no-show model and freeing capacity for waitlisted
  parties.
- The core tradeoff is that overbooking maximizes revenue but taxes goodwill;
  the model must therefore be tuned from real data and reviewed frequently, with
  per-restaurant controls on the ceiling.
- The whole lifecycle is logged so restaurants can see exactly how overbooking
  converted into revenue or compensation.

### Q: How do you distribute reservations across restaurants?

**A:** Distribution is about routing demand to supply: the search experience must
surface restaurants that can actually seat the party, and the back-end must
handle the fact that reservations are extremely concentrated in a few cities and
meal windows.

- I would shard by metro area, since a diner searches within their city and
  cross-city booking is rare.
- Search and availability are read-heavy, so each shard runs replicas and a
  local cache of slot availability.
- The shard also keeps the restaurant's portal traffic local, so a restaurant
  editing its floor plan during dinner rush only affects its own shard.

Within a metro, the availability engine precomputes a compact summary of open
slots per restaurant for the next few days, updated on a short cycle.

- Search reads this summary so it can filter and rank only restaurants that are
  genuinely bookable, avoiding the poor experience of sending a diner to a
  restaurant with no open slot.
- The summary also powers demand insights, letting the platform nudge
  restaurants with flexible hours or recommend alternative cuisines when a
  search is over-subscribed.
- Confirmation of a booking happens against the shard-local availability engine,
  so the search summary never needs to be perfectly synchronized with the
  reservation database.

The main tradeoff is regional isolation versus global features like cross-market
ranking or a unified waitlist.

- I would accept regional isolation because it buys simpler transactions and
  lower latency, and run global reporting as an offline job over shard exports.
- Load spikes at holidays are absorbed by scaling the affected metro's replicas
  and cache nodes independently, so a surge in one city does not consume another
  city's resources.

### Q: How do you handle the waitlist and real-time updates?

**A:** The waitlist exists because popular restaurants sell out, and it converts
overflow demand into guaranteed future or same-day seats.

- I would model the waitlist as a priority queue per restaurant and date,
  ordered by join time with an optional party-size constraint.
- When a slot opens (through a cancellation or a no-show), the waitlist service
  notifies the next eligible party and holds the slot for a short confirm
  window, then releases it if the party declines.
- Same-day waitlists use join time as priority, while future-date waitlists can
  also be filtered by the party's preferred window to avoid noisy notifications.

Real-time updates flow over WebSockets or server-sent events through the
notification service.

- A diner on the waitlist sees their position move as earlier parties are
  seated, and the host sees the queue live in the portal.
- Position is computed from the persistent queue, not from broadcast deltas, so
  reconnecting clients always converge to the same number; broadcasts only push
  deltas to keep client-side state cheap.
- Rate limits on notifications prevent a spike of slot opens from hammering the
  messaging pipeline, batching by restaurant.

The queue must survive partial failures: notifying a party is a saga where the
slot is held transactionally, the notification is queued, and a timeout releases
the hold.

- Redis provides the fast in-memory queue while the Reservations DB remains the
  durable record, so restarts do not lose positions.
- The design tradeoff is latency against strictness; eventual position updates
  are fine as long as the final offer is atomic.
- Analytics over conversion rates (offers accepted versus declined) let
  restaurants tune party-size and wait-time thresholds.

## Source

```text
title: Restaurant Reservation
node diner: Diner [round, icon=browser]
node app: Booking App [icon=browser]
node gateway: API Gateway [icon=server]
node search: Restaurant Search [icon=search]
node avail: Table Availability [icon=cache]
node booking: Reservation Service [icon=compute]
node waitlist: Waitlist [icon=queue]
node notify: Notifications [icon=message]
node restaurant: Restaurant Portal [icon=browser]
node db: Reservations DB [cylinder, icon=database]

edge diner -> app: find restaurant
edge app -> gateway: query
edge gateway -> search: matches
edge gateway -> avail: check tables
edge avail -> booking: reserve
edge booking -> db: store
edge booking -> notify: confirm
edge diner -> waitlist: join
edge waitlist -> notify: slot open
edge restaurant -> avail: update tables
edge restaurant -> booking: manage
edge avail -> search: capacity
```
