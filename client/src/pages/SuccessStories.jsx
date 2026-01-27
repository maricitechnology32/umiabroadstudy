import { Quote, Star } from 'lucide-react';
import { fixImageUrl } from '../utils/imageUtils';

export default function SuccessStories() {
  const reviews = [
    {
      name: "Suman K.",
      role: "Student Visa Applicant",
      location: "Kathmandu",
      content: "I was terrified of the immigration interview. The AI simulator asked the exact same questions the real officer did at Narita. I passed with confidence!",
      rating: 5,
      image: "https://i.pravatar.cc/150?u=suman"
    },
    {
      name: "Priya Sharma",
      role: "Education Consultant",
      location: "Putalisadak",
      content: "We manage 200+ students per intake. This dashboard cut our documentation time by half. The auto-COE generation is a lifesaver.",
      rating: 5,
      image: "https://i.pravatar.cc/150?u=priya"
    },
    {
      name: "Ramesh T.",
      role: "Skilled Worker (SSW)",
      location: "Pokhara",
      content: "The document checklist features helped me realize I was missing my tax clearance before I applied. Saved me from a rejection.",
      rating: 4,
      image: "https://i.pravatar.cc/150?u=ramesh"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trusted by <span className="text-green-600">Dreamers</span> & <span className="text-purple-600">Agencies</span>.
          </h2>
          <p className="text-slate-500 text-lg">
            See how JapanVisa.ai is changing the immigration journey for thousands of Nepali students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={`${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
                ))}
              </div>

              <div className="relative mb-6 flex-grow">
                <Quote className="absolute -top-2 -left-2 text-green-100 transform -scale-x-100" size={48} />
                <p className="text-slate-700 relative z-10 leading-relaxed">"{review.content}"</p>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  {/* Fallback avatar if image fails */}
                  <img src={fixImageUrl(review.image)} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                  <p className="text-xs text-slate-500">{review.role} • {review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}