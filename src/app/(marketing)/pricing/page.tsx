import PricingContent from "./PricingContent";

export const metadata = {
  title: "Pricing - Solaris Cowork",
  description: "Choose a plan that fits your needs and get access to AI-powered tools.",
};

export default function PricingPage() {
  return (
    <div className="min-h-[80vh] py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Get access to your own OpenRouter API key and unlock AI-powered
            capabilities for your projects.
          </p>
        </div>
        <PricingContent />
      </div>
    </div>
  );
}
