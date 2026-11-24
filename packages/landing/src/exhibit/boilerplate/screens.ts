/*
 * GENERATED — one lazy chunk per template screen.
 * Each entry dynamic-imports a single template file so the gallery only
 * ships the screen being viewed.
 */
import dynamic from 'next/dynamic';

export const boilerplateScreens = {
  app: {
    ActivityLogTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/ActivityLogTemplate').then(
        (m) => m.ActivityLogTemplate,
      ),
    ),
    AnalyticsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/AnalyticsTemplate').then(
        (m) => m.AnalyticsTemplate,
      ),
    ),
    CalendarTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/CalendarTemplate').then(
        (m) => m.CalendarTemplate,
      ),
    ),
    ChatTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/ChatTemplate').then(
        (m) => m.ChatTemplate,
      ),
    ),
    ContactsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/ContactsTemplate').then(
        (m) => m.ContactsTemplate,
      ),
    ),
    DashboardTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/DashboardTemplate').then(
        (m) => m.DashboardTemplate,
      ),
    ),
    FilesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/FilesTemplate').then(
        (m) => m.FilesTemplate,
      ),
    ),
    GoalsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/GoalsTemplate').then(
        (m) => m.GoalsTemplate,
      ),
    ),
    HelpCenterTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/HelpCenterTemplate').then(
        (m) => m.HelpCenterTemplate,
      ),
    ),
    InboxTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/InboxTemplate').then(
        (m) => m.InboxTemplate,
      ),
    ),
    IntegrationsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/IntegrationsTemplate').then(
        (m) => m.IntegrationsTemplate,
      ),
    ),
    KanbanTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/KanbanTemplate').then(
        (m) => m.KanbanTemplate,
      ),
    ),
    MeetingsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/MeetingsTemplate').then(
        (m) => m.MeetingsTemplate,
      ),
    ),
    MembersTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/MembersTemplate').then(
        (m) => m.MembersTemplate,
      ),
    ),
    NotificationsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/NotificationsTemplate').then(
        (m) => m.NotificationsTemplate,
      ),
    ),
    TasksTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/app/TasksTemplate').then(
        (m) => m.TasksTemplate,
      ),
    ),
  },
  auth: {
    ChangePasswordTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/ChangePasswordTemplate').then(
        (m) => m.ChangePasswordTemplate,
      ),
    ),
    DeleteAccountTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/DeleteAccountTemplate').then(
        (m) => m.DeleteAccountTemplate,
      ),
    ),
    ErrorTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/ErrorTemplate').then(
        (m) => m.ErrorTemplate,
      ),
    ),
    ForbiddenTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/ForbiddenTemplate').then(
        (m) => m.ForbiddenTemplate,
      ),
    ),
    PasswordResetTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/PasswordResetTemplate').then(
        (m) => m.PasswordResetTemplate,
      ),
    ),
    SecurityTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/SecurityTemplate').then(
        (m) => m.SecurityTemplate,
      ),
    ),
    LockScreenTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/LockScreenTemplate').then(
        (m) => m.LockScreenTemplate,
      ),
    ),
    PermissionsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/PermissionsTemplate').then(
        (m) => m.PermissionsTemplate,
      ),
    ),
    RecoveryCodesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/RecoveryCodesTemplate').then(
        (m) => m.RecoveryCodesTemplate,
      ),
    ),
    SecurityOverviewTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/SecurityOverviewTemplate').then(
        (m) => m.SecurityOverviewTemplate,
      ),
    ),
    SessionsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/SessionsTemplate').then(
        (m) => m.SessionsTemplate,
      ),
    ),
    SignInTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/SignInTemplate').then(
        (m) => m.SignInTemplate,
      ),
    ),
    SignUpTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/SignUpTemplate').then(
        (m) => m.SignUpTemplate,
      ),
    ),
    TwoFactorTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/TwoFactorTemplate').then(
        (m) => m.TwoFactorTemplate,
      ),
    ),
    VerifyEmailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/auth/VerifyEmailTemplate').then(
        (m) => m.VerifyEmailTemplate,
      ),
    ),
  },
  blog: {
    BlogItemTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/BlogItemTemplate').then(
        (m) => m.BlogItemTemplate,
      ),
    ),
    AchievementsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/AchievementsTemplate').then(
        (m) => m.AchievementsTemplate,
      ),
    ),
    LearningAnalyticsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/LearningAnalyticsTemplate').then(
        (m) => m.LearningAnalyticsTemplate,
      ),
    ),
    BlogArchiveTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/BlogArchiveTemplate').then(
        (m) => m.BlogArchiveTemplate,
      ),
    ),
    BlogAuthorTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/BlogAuthorTemplate').then(
        (m) => m.BlogAuthorTemplate,
      ),
    ),
    CourseCatalogTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/CourseCatalogTemplate').then(
        (m) => m.CourseCatalogTemplate,
      ),
    ),
    BlogCategoriesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/BlogCategoriesTemplate').then(
        (m) => m.BlogCategoriesTemplate,
      ),
    ),
    CourseDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/CourseDetailTemplate').then(
        (m) => m.CourseDetailTemplate,
      ),
    ),
    BlogListTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/BlogListTemplate').then(
        (m) => m.BlogListTemplate,
      ),
    ),
    InstructorsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/InstructorsTemplate').then(
        (m) => m.InstructorsTemplate,
      ),
    ),
    LessonPlayerTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/LessonPlayerTemplate').then(
        (m) => m.LessonPlayerTemplate,
      ),
    ),
    MyCoursesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/MyCoursesTemplate').then(
        (m) => m.MyCoursesTemplate,
      ),
    ),
    BlogNewsletterTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/BlogNewsletterTemplate').then(
        (m) => m.BlogNewsletterTemplate,
      ),
    ),
    QuizzesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/QuizzesTemplate').then(
        (m) => m.QuizzesTemplate,
      ),
    ),
    BlogSearchTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/BlogSearchTemplate').then(
        (m) => m.BlogSearchTemplate,
      ),
    ),
    BlogTagsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/blog/BlogTagsTemplate').then(
        (m) => m.BlogTagsTemplate,
      ),
    ),
  },
  crm: {
    AccountsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/AccountsTemplate').then(
        (m) => m.AccountsTemplate,
      ),
    ),
    CampaignsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/CampaignsTemplate').then(
        (m) => m.CampaignsTemplate,
      ),
    ),
    CrmContactsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/CrmContactsTemplate').then(
        (m) => m.CrmContactsTemplate,
      ),
    ),
    CouponsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/CouponsTemplate').then(
        (m) => m.CouponsTemplate,
      ),
    ),
    CustomersTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/CustomersTemplate').then(
        (m) => m.CustomersTemplate,
      ),
    ),
    DealsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/DealsTemplate').then(
        (m) => m.DealsTemplate,
      ),
    ),
    InventoryTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/InventoryTemplate').then(
        (m) => m.InventoryTemplate,
      ),
    ),
    LeadsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/LeadsTemplate').then(
        (m) => m.LeadsTemplate,
      ),
    ),
    OrdersTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/OrdersTemplate').then(
        (m) => m.OrdersTemplate,
      ),
    ),
    PipelineTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/PipelineTemplate').then(
        (m) => m.PipelineTemplate,
      ),
    ),
    ProductsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/ProductsTemplate').then(
        (m) => m.ProductsTemplate,
      ),
    ),
    PromotionsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/PromotionsTemplate').then(
        (m) => m.PromotionsTemplate,
      ),
    ),
    QuoteBuilderTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/QuoteBuilderTemplate').then(
        (m) => m.QuoteBuilderTemplate,
      ),
    ),
    RefundsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/RefundsTemplate').then(
        (m) => m.RefundsTemplate,
      ),
    ),
    SalesReportsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/SalesReportsTemplate').then(
        (m) => m.SalesReportsTemplate,
      ),
    ),
    ShipmentsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/crm/ShipmentsTemplate').then(
        (m) => m.ShipmentsTemplate,
      ),
    ),
  },
  developer: {
    ApiKeysTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/ApiKeysTemplate').then(
        (m) => m.ApiKeysTemplate,
      ),
    ),
    AutomationsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/AutomationsTemplate').then(
        (m) => m.AutomationsTemplate,
      ),
    ),
    BackupsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/BackupsTemplate').then(
        (m) => m.BackupsTemplate,
      ),
    ),
    DeviceDashboardTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/DeviceDashboardTemplate').then(
        (m) => m.DeviceDashboardTemplate,
      ),
    ),
    DeploymentsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/DeploymentsTemplate').then(
        (m) => m.DeploymentsTemplate,
      ),
    ),
    DeviceDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/DeviceDetailTemplate').then(
        (m) => m.DeviceDetailTemplate,
      ),
    ),
    EndpointsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/EndpointsTemplate').then(
        (m) => m.EndpointsTemplate,
      ),
    ),
    EnergyUsageTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/EnergyUsageTemplate').then(
        (m) => m.EnergyUsageTemplate,
      ),
    ),
    EnvironmentsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/EnvironmentsTemplate').then(
        (m) => m.EnvironmentsTemplate,
      ),
    ),
    FeatureFlagsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/FeatureFlagsTemplate').then(
        (m) => m.FeatureFlagsTemplate,
      ),
    ),
    LogsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/LogsTemplate').then(
        (m) => m.LogsTemplate,
      ),
    ),
    MonitorsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/MonitorsTemplate').then(
        (m) => m.MonitorsTemplate,
      ),
    ),
    ScenesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/ScenesTemplate').then(
        (m) => m.ScenesTemplate,
      ),
    ),
    SensorDataTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/SensorDataTemplate').then(
        (m) => m.SensorDataTemplate,
      ),
    ),
    SmartHomeSettingsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/SmartHomeSettingsTemplate').then(
        (m) => m.SmartHomeSettingsTemplate,
      ),
    ),
    WebhooksTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/developer/WebhooksTemplate').then(
        (m) => m.WebhooksTemplate,
      ),
    ),
  },
  finance: {
    AccountsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/AccountsTemplate').then(
        (m) => m.AccountsTemplate,
      ),
    ),
    AlertsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/AlertsTemplate').then(
        (m) => m.AlertsTemplate,
      ),
    ),
    BillingTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/BillingTemplate').then(
        (m) => m.BillingTemplate,
      ),
    ),
    BudgetsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/BudgetsTemplate').then(
        (m) => m.BudgetsTemplate,
      ),
    ),
    DividendIncomeTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/DividendIncomeTemplate').then(
        (m) => m.DividendIncomeTemplate,
      ),
    ),
    ExpensesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/ExpensesTemplate').then(
        (m) => m.ExpensesTemplate,
      ),
    ),
    HoldingsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/HoldingsTemplate').then(
        (m) => m.HoldingsTemplate,
      ),
    ),
    InvoicesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/InvoicesTemplate').then(
        (m) => m.InvoicesTemplate,
      ),
    ),
    PortfolioOverviewTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/PortfolioOverviewTemplate').then(
        (m) => m.PortfolioOverviewTemplate,
      ),
    ),
    PayrollTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/PayrollTemplate').then(
        (m) => m.PayrollTemplate,
      ),
    ),
    PerformanceTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/PerformanceTemplate').then(
        (m) => m.PerformanceTemplate,
      ),
    ),
    PortfolioSettingsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/PortfolioSettingsTemplate').then(
        (m) => m.PortfolioSettingsTemplate,
      ),
    ),
    StatementsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/StatementsTemplate').then(
        (m) => m.StatementsTemplate,
      ),
    ),
    SubscriptionsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/SubscriptionsTemplate').then(
        (m) => m.SubscriptionsTemplate,
      ),
    ),
    TaxesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/TaxesTemplate').then(
        (m) => m.TaxesTemplate,
      ),
    ),
    TransactionsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/finance/TransactionsTemplate').then(
        (m) => m.TransactionsTemplate,
      ),
    ),
  },
  health: {
    ActivityTrackerTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/ActivityTrackerTemplate').then(
        (m) => m.ActivityTrackerTemplate,
      ),
    ),
    HealthDashboardTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/HealthDashboardTemplate').then(
        (m) => m.HealthDashboardTemplate,
      ),
    ),
    FoodDeliveryTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/FoodDeliveryTemplate').then(
        (m) => m.FoodDeliveryTemplate,
      ),
    ),
    GoalsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/GoalsTemplate').then(
        (m) => m.GoalsTemplate,
      ),
    ),
    MenuTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/MenuTemplate').then(
        (m) => m.MenuTemplate,
      ),
    ),
    NutritionTrackerTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/NutritionTrackerTemplate').then(
        (m) => m.NutritionTrackerTemplate,
      ),
    ),
    HealthProfileTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/HealthProfileTemplate').then(
        (m) => m.HealthProfileTemplate,
      ),
    ),
    RecipeDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/RecipeDetailTemplate').then(
        (m) => m.RecipeDetailTemplate,
      ),
    ),
    RecipesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/RecipesTemplate').then(
        (m) => m.RecipesTemplate,
      ),
    ),
    ReservationsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/ReservationsTemplate').then(
        (m) => m.ReservationsTemplate,
      ),
    ),
    RestaurantDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/RestaurantDetailTemplate').then(
        (m) => m.RestaurantDetailTemplate,
      ),
    ),
    RestaurantListTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/RestaurantListTemplate').then(
        (m) => m.RestaurantListTemplate,
      ),
    ),
    SleepTrackerTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/SleepTrackerTemplate').then(
        (m) => m.SleepTrackerTemplate,
      ),
    ),
    WaterIntakeTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/WaterIntakeTemplate').then(
        (m) => m.WaterIntakeTemplate,
      ),
    ),
    WineListTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/WineListTemplate').then(
        (m) => m.WineListTemplate,
      ),
    ),
    WorkoutPlannerTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/health/WorkoutPlannerTemplate').then(
        (m) => m.WorkoutPlannerTemplate,
      ),
    ),
  },
  hr: {
    AccordionTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/AccordionTemplate').then(
        (m) => m.AccordionTemplate,
      ),
    ),
    AlertsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/AlertsTemplate').then(
        (m) => m.AlertsTemplate,
      ),
    ),
    BenefitsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/BenefitsTemplate').then(
        (m) => m.BenefitsTemplate,
      ),
    ),
    ChartsGalleryTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/ChartsGalleryTemplate').then(
        (m) => m.ChartsGalleryTemplate,
      ),
    ),
    DataTableTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/DataTableTemplate').then(
        (m) => m.DataTableTemplate,
      ),
    ),
    EmptyStatesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/EmptyStatesTemplate').then(
        (m) => m.EmptyStatesTemplate,
      ),
    ),
    FormsShowcaseTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/FormsShowcaseTemplate').then(
        (m) => m.FormsShowcaseTemplate,
      ),
    ),
    HiringPipelineTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/HiringPipelineTemplate').then(
        (m) => m.HiringPipelineTemplate,
      ),
    ),
    ModalsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/ModalsTemplate').then(
        (m) => m.ModalsTemplate,
      ),
    ),
    OrgChartTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/OrgChartTemplate').then(
        (m) => m.OrgChartTemplate,
      ),
    ),
    PeopleDirectoryTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/PeopleDirectoryTemplate').then(
        (m) => m.PeopleDirectoryTemplate,
      ),
    ),
    PoliciesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/PoliciesTemplate').then(
        (m) => m.PoliciesTemplate,
      ),
    ),
    PerformanceReviewsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/PerformanceReviewsTemplate').then(
        (m) => m.PerformanceReviewsTemplate,
      ),
    ),
    ShiftScheduleTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/ShiftScheduleTemplate').then(
        (m) => m.ShiftScheduleTemplate,
      ),
    ),
    TabsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/TabsTemplate').then(
        (m) => m.TabsTemplate,
      ),
    ),
    TimeOffTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/hr/TimeOffTemplate').then(
        (m) => m.TimeOffTemplate,
      ),
    ),
  },
  landing: {
    CareersTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/CareersTemplate').then(
        (m) => m.CareersTemplate,
      ),
    ),
    ChangelogTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/ChangelogTemplate').then(
        (m) => m.ChangelogTemplate,
      ),
    ),
    ContactTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/ContactTemplate').then(
        (m) => m.ContactTemplate,
      ),
    ),
    GameDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/GameDetailTemplate').then(
        (m) => m.GameDetailTemplate,
      ),
    ),
    LandingTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/LandingTemplate').then(
        (m) => m.LandingTemplate,
      ),
    ),
    NotesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/NotesTemplate').then(
        (m) => m.NotesTemplate,
      ),
    ),
    PricingTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/PricingTemplate').then(
        (m) => m.PricingTemplate,
      ),
    ),
    LegalTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/LegalTemplate').then(
        (m) => m.LegalTemplate,
      ),
    ),
    ResumeTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/ResumeTemplate').then(
        (m) => m.ResumeTemplate,
      ),
    ),
    RoadmapTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/RoadmapTemplate').then(
        (m) => m.RoadmapTemplate,
      ),
    ),
    SettingsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/SettingsTemplate').then(
        (m) => m.SettingsTemplate,
      ),
    ),
    ShortcutsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/ShortcutsTemplate').then(
        (m) => m.ShortcutsTemplate,
      ),
    ),
    SprintsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/SprintsTemplate').then(
        (m) => m.SprintsTemplate,
      ),
    ),
    TeamTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/TeamTemplate').then(
        (m) => m.TeamTemplate,
      ),
    ),
    VersionTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/VersionTemplate').then(
        (m) => m.VersionTemplate,
      ),
    ),
    WhiteboardTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/landing/WhiteboardTemplate').then(
        (m) => m.WhiteboardTemplate,
      ),
    ),
  },
  mail: {
    AllocationTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/AllocationTemplate').then(
        (m) => m.AllocationTemplate,
      ),
    ),
    GameCatalogTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/GameCatalogTemplate').then(
        (m) => m.GameCatalogTemplate,
      ),
    ),
    LaunchStatusTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/LaunchStatusTemplate').then(
        (m) => m.LaunchStatusTemplate,
      ),
    ),
    ComposeTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/ComposeTemplate').then(
        (m) => m.ComposeTemplate,
      ),
    ),
    DraftsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/DraftsTemplate').then(
        (m) => m.DraftsTemplate,
      ),
    ),
    ImportTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/ImportTemplate').then(
        (m) => m.ImportTemplate,
      ),
    ),
    InboxTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/InboxTemplate').then(
        (m) => m.InboxTemplate,
      ),
    ),
    LabelsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/LabelsTemplate').then(
        (m) => m.LabelsTemplate,
      ),
    ),
    OnboardingTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/OnboardingTemplate').then(
        (m) => m.OnboardingTemplate,
      ),
    ),
    MailSearchTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/MailSearchTemplate').then(
        (m) => m.MailSearchTemplate,
      ),
    ),
    SentTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/SentTemplate').then(
        (m) => m.SentTemplate,
      ),
    ),
    SpamTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/SpamTemplate').then(
        (m) => m.SpamTemplate,
      ),
    ),
    ThreadTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/ThreadTemplate').then(
        (m) => m.ThreadTemplate,
      ),
    ),
    TimesheetsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/TimesheetsTemplate').then(
        (m) => m.TimesheetsTemplate,
      ),
    ),
    TransactionsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/TransactionsTemplate').then(
        (m) => m.TransactionsTemplate,
      ),
    ),
    WatchlistTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/mail/WatchlistTemplate').then(
        (m) => m.WatchlistTemplate,
      ),
    ),
  },
  media: {
    AlbumDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/AlbumDetailTemplate').then(
        (m) => m.AlbumDetailTemplate,
      ),
    ),
    AlbumsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/AlbumsTemplate').then(
        (m) => m.AlbumsTemplate,
      ),
    ),
    ArtistsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/ArtistsTemplate').then(
        (m) => m.ArtistsTemplate,
      ),
    ),
    ChartsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/ChartsTemplate').then(
        (m) => m.ChartsTemplate,
      ),
    ),
    ContinueWatchingTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/ContinueWatchingTemplate').then(
        (m) => m.ContinueWatchingTemplate,
      ),
    ),
    MediaLibraryTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/MediaLibraryTemplate').then(
        (m) => m.MediaLibraryTemplate,
      ),
    ),
    LyricsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/LyricsTemplate').then(
        (m) => m.LyricsTemplate,
      ),
    ),
    MovieDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/MovieDetailTemplate').then(
        (m) => m.MovieDetailTemplate,
      ),
    ),
    MusicHomeTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/MusicHomeTemplate').then(
        (m) => m.MusicHomeTemplate,
      ),
    ),
    MyListTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/MyListTemplate').then(
        (m) => m.MyListTemplate,
      ),
    ),
    NowPlayingTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/NowPlayingTemplate').then(
        (m) => m.NowPlayingTemplate,
      ),
    ),
    PlaylistTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/PlaylistTemplate').then(
        (m) => m.PlaylistTemplate,
      ),
    ),
    MusicSearchTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/MusicSearchTemplate').then(
        (m) => m.MusicSearchTemplate,
      ),
    ),
    TvSeriesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/TvSeriesTemplate').then(
        (m) => m.TvSeriesTemplate,
      ),
    ),
    StreamingHomeTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/StreamingHomeTemplate').then(
        (m) => m.StreamingHomeTemplate,
      ),
    ),
    VideoPlayerTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/media/VideoPlayerTemplate').then(
        (m) => m.VideoPlayerTemplate,
      ),
    ),
  },
  news: {
    ArticleTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/ArticleTemplate').then(
        (m) => m.ArticleTemplate,
      ),
    ),
    BreakingNewsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/BreakingNewsTemplate').then(
        (m) => m.BreakingNewsTemplate,
      ),
    ),
    NewsCategoriesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/NewsCategoriesTemplate').then(
        (m) => m.NewsCategoriesTemplate,
      ),
    ),
    EditorialTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/EditorialTemplate').then(
        (m) => m.EditorialTemplate,
      ),
    ),
    FavoriteTeamsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/FavoriteTeamsTemplate').then(
        (m) => m.FavoriteTeamsTemplate,
      ),
    ),
    FixturesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/FixturesTemplate').then(
        (m) => m.FixturesTemplate,
      ),
    ),
    MagazineGridTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/MagazineGridTemplate').then(
        (m) => m.MagazineGridTemplate,
      ),
    ),
    MatchDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/MatchDetailTemplate').then(
        (m) => m.MatchDetailTemplate,
      ),
    ),
    SportsNewsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/SportsNewsTemplate').then(
        (m) => m.SportsNewsTemplate,
      ),
    ),
    NewsletterSignupTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/NewsletterSignupTemplate').then(
        (m) => m.NewsletterSignupTemplate,
      ),
    ),
    OpinionTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/OpinionTemplate').then(
        (m) => m.OpinionTemplate,
      ),
    ),
    PressReleasesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/PressReleasesTemplate').then(
        (m) => m.PressReleasesTemplate,
      ),
    ),
    TeamRosterTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/TeamRosterTemplate').then(
        (m) => m.TeamRosterTemplate,
      ),
    ),
    LiveScoresTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/LiveScoresTemplate').then(
        (m) => m.LiveScoresTemplate,
      ),
    ),
    SeasonStandingsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/SeasonStandingsTemplate').then(
        (m) => m.SeasonStandingsTemplate,
      ),
    ),
    PlayerStatsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/news/PlayerStatsTemplate').then(
        (m) => m.PlayerStatsTemplate,
      ),
    ),
  },
  social: {
    GameChallengesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/GameChallengesTemplate').then(
        (m) => m.GameChallengesTemplate,
      ),
    ),
    EventsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/EventsTemplate').then(
        (m) => m.EventsTemplate,
      ),
    ),
    FeedTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/FeedTemplate').then(
        (m) => m.FeedTemplate,
      ),
    ),
    FollowersTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/FollowersTemplate').then(
        (m) => m.FollowersTemplate,
      ),
    ),
    GroupsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/GroupsTemplate').then(
        (m) => m.GroupsTemplate,
      ),
    ),
    WatchHistoryTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/WatchHistoryTemplate').then(
        (m) => m.WatchHistoryTemplate,
      ),
    ),
    LeaderboardsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/LeaderboardsTemplate').then(
        (m) => m.LeaderboardsTemplate,
      ),
    ),
    LiveChannelsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/LiveChannelsTemplate').then(
        (m) => m.LiveChannelsTemplate,
      ),
    ),
    LiveMatchesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/LiveMatchesTemplate').then(
        (m) => m.LiveMatchesTemplate,
      ),
    ),
    MessagesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/MessagesTemplate').then(
        (m) => m.MessagesTemplate,
      ),
    ),
    GameNewsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/GameNewsTemplate').then(
        (m) => m.GameNewsTemplate,
      ),
    ),
    PlayerProfilesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/PlayerProfilesTemplate').then(
        (m) => m.PlayerProfilesTemplate,
      ),
    ),
    ProfileTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/ProfileTemplate').then(
        (m) => m.ProfileTemplate,
      ),
    ),
    ReportsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/ReportsTemplate').then(
        (m) => m.ReportsTemplate,
      ),
    ),
    StreamingSearchTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/StreamingSearchTemplate').then(
        (m) => m.StreamingSearchTemplate,
      ),
    ),
    TournamentsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/social/TournamentsTemplate').then(
        (m) => m.TournamentsTemplate,
      ),
    ),
  },
  store: {
    StoreItemTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/StoreItemTemplate').then(
        (m) => m.StoreItemTemplate,
      ),
    ),
    AddressBookTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/AddressBookTemplate').then(
        (m) => m.AddressBookTemplate,
      ),
    ),
    CartTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/CartTemplate').then(
        (m) => m.CartTemplate,
      ),
    ),
    CategoriesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/CategoriesTemplate').then(
        (m) => m.CategoriesTemplate,
      ),
    ),
    CheckoutTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/CheckoutTemplate').then(
        (m) => m.CheckoutTemplate,
      ),
    ),
    CompareTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/CompareTemplate').then(
        (m) => m.CompareTemplate,
      ),
    ),
    DealsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/DealsTemplate').then(
        (m) => m.DealsTemplate,
      ),
    ),
    GiftCardsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/GiftCardsTemplate').then(
        (m) => m.GiftCardsTemplate,
      ),
    ),
    StoreFrontTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/StoreFrontTemplate').then(
        (m) => m.StoreFrontTemplate,
      ),
    ),
    OrderConfirmationTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/OrderConfirmationTemplate').then(
        (m) => m.OrderConfirmationTemplate,
      ),
    ),
    OrderHistoryTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/OrderHistoryTemplate').then(
        (m) => m.OrderHistoryTemplate,
      ),
    ),
    PaymentMethodsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/PaymentMethodsTemplate').then(
        (m) => m.PaymentMethodsTemplate,
      ),
    ),
    ReviewsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/ReviewsTemplate').then(
        (m) => m.ReviewsTemplate,
      ),
    ),
    SupportTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/SupportTemplate').then(
        (m) => m.SupportTemplate,
      ),
    ),
    OrderTrackingTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/OrderTrackingTemplate').then(
        (m) => m.OrderTrackingTemplate,
      ),
    ),
    WishlistTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/store/WishlistTemplate').then(
        (m) => m.WishlistTemplate,
      ),
    ),
  },
  support: {
    AboutTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/AboutTemplate').then(
        (m) => m.AboutTemplate,
      ),
    ),
    AnnouncementsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/AnnouncementsTemplate').then(
        (m) => m.AnnouncementsTemplate,
      ),
    ),
    CookieConsentTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/CookieConsentTemplate').then(
        (m) => m.CookieConsentTemplate,
      ),
    ),
    FaqTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/FaqTemplate').then(
        (m) => m.FaqTemplate,
      ),
    ),
    FeedbackTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/FeedbackTemplate').then(
        (m) => m.FeedbackTemplate,
      ),
    ),
    KnowledgeBaseTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/KnowledgeBaseTemplate').then(
        (m) => m.KnowledgeBaseTemplate,
      ),
    ),
    LiveChatTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/LiveChatTemplate').then(
        (m) => m.LiveChatTemplate,
      ),
    ),
    LoadingTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/LoadingTemplate').then(
        (m) => m.LoadingTemplate,
      ),
    ),
    PaginationTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/PaginationTemplate').then(
        (m) => m.PaginationTemplate,
      ),
    ),
    SearchTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/SearchTemplate').then(
        (m) => m.SearchTemplate,
      ),
    ),
    ServiceStatusTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/ServiceStatusTemplate').then(
        (m) => m.ServiceStatusTemplate,
      ),
    ),
    StepperTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/StepperTemplate').then(
        (m) => m.StepperTemplate,
      ),
    ),
    TicketDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/TicketDetailTemplate').then(
        (m) => m.TicketDetailTemplate,
      ),
    ),
    TicketsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/TicketsTemplate').then(
        (m) => m.TicketsTemplate,
      ),
    ),
    TooltipsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/TooltipsTemplate').then(
        (m) => m.TooltipsTemplate,
      ),
    ),
    UploadTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/support/UploadTemplate').then(
        (m) => m.UploadTemplate,
      ),
    ),
  },
  travel: {
    AgentProfileTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/AgentProfileTemplate').then(
        (m) => m.AgentProfileTemplate,
      ),
    ),
    BookingsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/BookingsTemplate').then(
        (m) => m.BookingsTemplate,
      ),
    ),
    DestinationsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/DestinationsTemplate').then(
        (m) => m.DestinationsTemplate,
      ),
    ),
    TravelGuidesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/TravelGuidesTemplate').then(
        (m) => m.TravelGuidesTemplate,
      ),
    ),
    HotelDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/HotelDetailTemplate').then(
        (m) => m.HotelDetailTemplate,
      ),
    ),
    PropertyListingsTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/PropertyListingsTemplate').then(
        (m) => m.PropertyListingsTemplate,
      ),
    ),
    MapViewTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/MapViewTemplate').then(
        (m) => m.MapViewTemplate,
      ),
    ),
    MortgageCalculatorTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/MortgageCalculatorTemplate').then(
        (m) => m.MortgageCalculatorTemplate,
      ),
    ),
    OpenHousesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/OpenHousesTemplate').then(
        (m) => m.OpenHousesTemplate,
      ),
    ),
    PackingListTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/PackingListTemplate').then(
        (m) => m.PackingListTemplate,
      ),
    ),
    TripPlannerTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/TripPlannerTemplate').then(
        (m) => m.TripPlannerTemplate,
      ),
    ),
    PropertyDetailTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/PropertyDetailTemplate').then(
        (m) => m.PropertyDetailTemplate,
      ),
    ),
    SearchFiltersTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/SearchFiltersTemplate').then(
        (m) => m.SearchFiltersTemplate,
      ),
    ),
    SavedPropertiesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/SavedPropertiesTemplate').then(
        (m) => m.SavedPropertiesTemplate,
      ),
    ),
    BookingSearchTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/BookingSearchTemplate').then(
        (m) => m.BookingSearchTemplate,
      ),
    ),
    TravelStoriesTemplate: dynamic(() =>
      import('@/exhibit/boilerplate/components/templates/travel/TravelStoriesTemplate').then(
        (m) => m.TravelStoriesTemplate,
      ),
    ),
  },
} as const;
