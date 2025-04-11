import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    id: "plan-free",
    href: "https://github.com/apps/pushtoprod-ai",
    price: { monthly: "$0", annually: "$0" },
    description: "Perfect for individual developers and open source projects.",
    actionTitle: "Get started",
    features: [
      "Automatic PR descriptions",
      "Code change analysis",
      "GitHub-formatted markdown",
      "Compatible with public repositories",
      "Community support"
    ],
    popular: false,
  },
  {
    name: "Team",
    id: "plan-team",
    href: "https://github.com/apps/pushtoprod-ai",
    price: { monthly: "$0", annually: "$0" },
    description: "Ideal for development teams working together.",
    actionTitle: "Get started",
    features: [
      "Everything in Free",
      "Private repository support",
      "Customizable PR templates",
      "Priority processing",
      "Email support",
      "Integration with Jira"
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    id: "plan-enterprise",
    href: "https://github.com/push-to-prod-ai/push-to-prod/discussions",
    price: { monthly: "$Custom", annually: "Custom" },
    description: "For large organizations with advanced needs.",
    actionTitle: "Contact us",
    features: [
      "Everything in Team",
      "Self-hosting option",
      "Dedicated support",
      "Custom integrations",
      "Advanced analytics",
      "Team training and onboarding",
      "SLA guarantees"
    ],
    popular: false,
  },
];

export function PricingSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-muted-foreground">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Choose the perfect plan for your needs
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-center">
          Simple, transparent pricing for teams of all sizes. Let AI handle your PR descriptions while you focus on shipping quality code faster.
        </p>
        <div className="mt-20 flow-root">
          <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 gap-x-4 sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 xl:-mx-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={cn("flex flex-col", plan.popular ? "ring-1 ring-primary" : "")}>
                <CardHeader>
                  <CardTitle id={plan.id} className="text-base font-semibold leading-7">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-5xl font-bold tracking-tight text-primary">{plan.price.monthly}</span>
                    <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                  </CardDescription>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.price.annually} billed annually</p>
                </CardHeader>
                <CardContent>
                  <p className="mt-10 text-sm font-semibold leading-6 text-primary">{plan.description}</p>
                  <ul role="list" className="mt-6 space-y-3 text-sm leading-6 text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button className="w-full" aria-describedby={plan.id} asChild>
                    <a href={plan.href}>{plan.actionTitle}</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
