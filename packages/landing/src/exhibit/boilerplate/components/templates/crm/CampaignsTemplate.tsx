'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

type Channel = 'Email' | 'Ads' | 'Social';
type CampaignStatus = 'Draft' | 'Running' | 'Completed';
type StatusFilter = 'All' | CampaignStatus;

interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: CampaignStatus;
  sent: number;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: 'p1',
    name: 'Spring Newsletter',
    channel: 'Email',
    status: 'Draft',
    sent: 0,
  },
  {
    id: 'p2',
    name: 'Winter Sale Blast',
    channel: 'Ads',
    status: 'Draft',
    sent: 0,
  },
  {
    id: 'p3',
    name: 'Product Launch',
    channel: 'Email',
    status: 'Running',
    sent: 12400,
  },
  {
    id: 'p4',
    name: 'Brand Awareness',
    channel: 'Social',
    status: 'Completed',
    sent: 23000,
  },
  {
    id: 'p5',
    name: 'Welcome Flow',
    channel: 'Email',
    status: 'Completed',
    sent: 18000,
  },
];

const FILTERS: StatusFilter[] = ['All', 'Draft', 'Running', 'Completed'];

const getChannelBadge = (channel: Channel) => {
  switch (channel) {
    case 'Email':
      return <span className="badge badge-info badge-sm">Email</span>;
    case 'Ads':
      return <span className="badge badge-warning badge-sm">Ads</span>;
    default:
      return <span className="badge badge-success badge-sm">Social</span>;
  }
};

const getStatusBadge = (status: CampaignStatus) => {
  switch (status) {
    case 'Draft':
      return <span className="badge badge-neutral badge-sm">Draft</span>;
    case 'Running':
      return <span className="badge badge-info badge-sm">Running</span>;
    default:
      return <span className="badge badge-success badge-sm">Completed</span>;
  }
};

export const CampaignsTemplate: FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [filter, setFilter] = useState<StatusFilter>('All');

  const visible = campaigns.filter(
    (campaign) => filter === 'All' || campaign.status === filter
  );

  const launchCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === id ? { ...campaign, status: 'Running' } : campaign
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Email and ad campaigns.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {visible.length} campaigns
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Channel</th>
                    <th className="px-4 py-3 text-right font-medium">Sent</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {campaign.name}
                      </td>
                      <td className="px-4 py-3">
                        {getChannelBadge(campaign.channel)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {campaign.sent.toLocaleString()} sent
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-4 py-3">
                        {campaign.status === 'Draft' && (
                          <button
                            type="button"
                            onClick={() => launchCampaign(campaign.id)}
                            className="btn btn-primary btn-sm gap-1">
                            <FiSend />
                            Launch
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

CampaignsTemplate.displayName = 'CampaignsTemplate';
