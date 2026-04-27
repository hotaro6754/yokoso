import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

function ContactFormCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900">Let&apos;s Talk</h3>
      <form className="mt-5 space-y-4">
        <input type="text" placeholder="Name" className="border rounded-md p-3 w-full" />
        <input type="email" placeholder="Email" className="border rounded-md p-3 w-full" />
        <input type="tel" placeholder="Phone number" className="border rounded-md p-3 w-full" />
        <input type="text" placeholder="Company name" className="border rounded-md p-3 w-full" />
        <textarea
          placeholder="Message"
          rows={4}
          className="border rounded-md p-3 w-full resize-none"
        />
        <button
          type="submit"
          className="bg-primary text-white rounded-md py-3 w-full font-semibold hover:bg-primary/90 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default function AboutContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Got something to say?</h1>
            <p className="mt-3 text-2xl md:text-3xl font-semibold text-primary">We&apos;re all ears</p>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Interested in Zodeck?</h3>
                <p className="mt-3 text-gray-600">
                  Just pick up the phone to chat with a member of our sales team.
                </p>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p className="inline-flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    +91-98765-43210
                  </p>
                  <p>
                    <a href="mailto:hr@zodeck.com" className="inline-flex items-center gap-2 text-primary hover:underline">
                      <Mail className="w-4 h-4" />
                      hr@zodeck.com
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Need any help?</h3>
                <p className="mt-3 text-gray-600">Don&apos;t worry, we&apos;re here for you.</p>
                <p className="mt-4">
                  <a href="mailto:hr@zodeck.com" className="inline-flex items-center gap-2 text-primary hover:underline">
                    <Mail className="w-4 h-4" />
                    hr@zodeck.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Our home base</h3>
                <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <iframe
                    title="Zodeck Office Location"
                    src="https://www.google.com/maps?q=Kondapur,Hyderabad&output=embed"
                    className="w-full h-64"
                    loading="lazy"
                  />
                </div>

                <div className="mt-5 space-y-5 text-gray-700">
                  <div>
                    <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Address
                    </p>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      Kondapur, Hyderabad, Telangana, India
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">Office Numbers</p>
                    <p className="mt-1 text-gray-600">Phone: +91-98765-43210</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">Office Hours</p>
                    <p className="mt-1 text-gray-600">Mon - Sat, 09:00am - 08:00pm</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ContactFormCard />
            </div>
          </div>
        </section>

        

        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-100 text-center">
          <h2 className="text-3xl font-bold text-gray-900">We&apos;re just a text away</h2>
          <div className="mt-8 flex items-center justify-center gap-4">
            {[
              { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
              { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
              { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
              { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
              { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-11 h-11 rounded-full border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/40 inline-flex items-center justify-center transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

