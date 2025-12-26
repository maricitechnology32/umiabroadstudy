import { Check, X } from 'lucide-react';
import { useState } from 'react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-500 text-lg mb-8">Choose the plan that fits your journey to Japan.</p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-slate-900 rounded-full p-1 transition-colors focus:outline-none"
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Yearly <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full ml-1">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* FREE PLAN */}
          <PricingCard
            title="Starter"
            price="0"
            desc="For students just starting their research."
            features={[
              "Basic Profile Builder",
              "Document Checklist",
              "1 AI Interview Session (5 mins)",
              "Community Support"
            ]}
            missing={[
              "Auto-Document Generation",
              "Unlimited AI Practice",
              "Priority Support"
            ]}
            btnText="Start for Free"
            btnStyle="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          />

          {/* PRO PLAN (Highlighted) */}
          <PricingCard
            title="Student Pro"
            price={isAnnual ? "15" : "19"}
            desc="Everything you need to secure your visa."
            isPopular={true}
            features={[
              "Unlimited AI Mock Interviews",
              "One-Click COE Generation",
              "Bank Statement Generator",
              "SOP Builder Assistant",
              "Priority Email Support"
            ]}
            btnText="Get Student Pro"
            btnStyle="bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200"
          />

          {/* AGENCY PLAN */}
          <PricingCard
            title="Consultancy"
            price={isAnnual ? "99" : "129"}
            desc="For agencies managing multiple students."
            features={[
              "Manage up to 50 Students",
              "Staff Accounts & Roles",
              "Bulk Document Export",
              "White-label Reports",
              "Dedicated Account Manager"
            ]}
            btnText="Contact Sales"
            btnStyle="bg-slate-900 text-white hover:bg-slate-800"
          />

        </div>
      </div>
    </section>
  );
}

function PricingCard({ title, price, desc, features, missing, btnText, btnStyle, isPopular }) {
  return (
    <div className={`relative p-6 sm:p-8 rounded-2xl bg-white border flex flex-col ${isPopular ? 'border-green-500 shadow-2xl md:scale-105 z-10' : 'border-slate-200 shadow-sm'}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 h-10">{desc}</p>
      </div>

      <div className="mb-8">
        <span className="text-4xl font-extrabold text-slate-900">${price}</span>
        <span className="text-slate-400">/mo</span>
      </div>

      <button className={`w-full py-3 rounded-xl font-bold transition-all mb-8 ${btnStyle}`}>
        {btnText}
      </button>

      <div className="space-y-4 flex-grow">
        {features.map((feat, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
            <Check size={18} className="text-green-500 shrink-0" />
            <span>{feat}</span>
          </div>
        ))}
        {missing && missing.map((feat, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-slate-400">
            <X size={18} className="text-slate-300 shrink-0" />
            <span>{feat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}