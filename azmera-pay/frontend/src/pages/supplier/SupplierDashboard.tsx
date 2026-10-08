import {
StoreIcon,
UsersIcon,
NetworkIcon,
ArrowRightIcon,
ClockIcon,
TagIcon,
} from '../../components/ui/icons'

const summaryCards = [
{
label: 'Active listings',
value: '0',
description: 'Products you currently offer',
icon: StoreIcon,
tone: 'bg-mint/50 text-forest-deeper',
},
{
label: 'New requests',
value: '0',
description: 'Requests awaiting your response',
icon: UsersIcon,
tone: 'bg-[#f1eed8] text-[#756b32]',
},
{
label: 'Potential matches',
value: '0',
description: 'Opportunities to review',
icon: NetworkIcon,
tone: 'bg-[#e8f0e7] text-forest',
},
]

const quickActions = [
{
title: 'Manage your listings',
description: 'Review the products, prices, and quantities you offer.',
label: 'View listings',
to: '/supplier/listings',
icon: StoreIcon,
},
{
title: 'Review requests',
description: 'See incoming agricultural requests relevant to your products.',
label: 'View requests',
to: '/supplier/requests',
icon: UsersIcon,
},
{
title: 'Explore matches',
description: 'Review potential matches between your listings and requests.',
label: 'View matches',
to: '/supplier/matches',
icon: NetworkIcon,
},
]

export default function SupplierDashboard() {
return ( <div className="mx-auto max-w-6xl space-y-8"> <section className="relative overflow-hidden rounded-3xl bg-forest-deeper px-6 py-8 text-white sm:px-9 sm:py-10"> <div className="bg-ethiopian-pattern pointer-events-none absolute inset-0 opacity-10" />

```
    <div className="relative max-w-2xl">
      <p className="mb-3 text-sm font-medium tracking-wide text-mint">
        SUPPLIER WORKSPACE
      </p>

      <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Grow your business with Azmera Pay.
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
        Manage your agricultural listings, review requests, and discover
        opportunities to connect with buyers.
      </p>

      <a
        href="/supplier/listings"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-forest-deeper transition-colors hover:bg-white"
      >
        Manage listings
        <ArrowRightIcon className="size-4" />
      </a>
    </div>
  </section>

  <section aria-labelledby="overview-heading">
    <div className="mb-5">
      <h2
        id="overview-heading"
        className="font-serif text-2xl font-semibold text-forest-deeper"
      >
        Your overview
      </h2>
      <p className="mt-1 text-sm text-stone">
        A quick look at your supplier activity.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {summaryCards.map((card) => {
        const Icon = card.icon

        return (
          <article
            key={card.label}
            className="rounded-2xl border border-forest/10 bg-white p-5 shadow-[0_4px_20px_rgba(22,95,48,0.04)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-forest-deeper">
                  {card.value}
                </p>
              </div>

              <div
                className={`grid size-11 place-items-center rounded-xl ${card.tone}`}
              >
                <Icon className="size-5" />
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-stone">
              {card.description}
            </p>
          </article>
        )
      })}
    </div>
  </section>

  <section aria-labelledby="actions-heading">
    <div className="mb-5">
      <h2
        id="actions-heading"
        className="font-serif text-2xl font-semibold text-forest-deeper"
      >
        Quick actions
      </h2>
      <p className="mt-1 text-sm text-stone">
        Pick up where you need to work.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      {quickActions.map((action) => {
        const Icon = action.icon

        return (
          <article
            key={action.title}
            className="group flex flex-col rounded-2xl border border-forest/10 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-[0_10px_28px_rgba(22,95,48,0.08)]"
          >
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-mint/50 text-forest-deeper">
              <Icon className="size-5" />
            </div>

            <h3 className="font-semibold text-forest-deeper">
              {action.title}
            </h3>

            <p className="mt-2 flex-1 text-sm leading-6 text-stone">
              {action.description}
            </p>

            <a
              href={action.to}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-forest-dark"
            >
              {action.label}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </article>
        )
      })}
    </div>
  </section>

  <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
    <div className="flex items-start gap-4">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f1eed8] text-[#756b32]">
        <ClockIcon className="size-5" />
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold text-forest-deeper">
          Keep your listings up to date
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone">
          Make sure your available quantities, prices, and listing validity
          reflect what you can currently supply.
        </p>
      </div>

      <TagIcon className="ml-auto hidden size-5 shrink-0 text-gold-dark sm:block" />
    </div>
  </section>
</div>


)
}
