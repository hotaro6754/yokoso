import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

type PolicySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const policySections: PolicySection[] = [
  {
    title: "Introduction",
    paragraphs: [
      "At Zodeck, we are committed to protecting your privacy and handling your data with transparency and care.",
      "This Privacy Policy explains how we collect, use, share, and protect information when you use our website and platform services.",
    ],
  },
  {
    title: "Information We Collect",
    paragraphs: [
      "We collect information you provide directly and data generated through your use of our services.",
    ],
    bullets: [
      "Personal information such as name, email address, and phone number",
      "Company information including organization name and business contact details",
      "Usage data such as device information, browser type, and interaction logs",
      "Cookies and tracking technologies to improve experience and performance",
    ],
  },
  {
    title: "How We Use Your Information",
    paragraphs: [
      "We use collected information to operate, improve, and secure our services.",
    ],
    bullets: [
      "Provide and maintain platform services",
      "Improve product features, usability, and reliability",
      "Offer customer support and resolve technical issues",
      "Send service updates, alerts, and important communications",
      "Prevent fraud, abuse, and unauthorized access",
    ],
  },
  {
    title: "Sharing of Information",
    paragraphs: [
      "We do not sell personal data. We may share data only in limited and lawful circumstances.",
    ],
    bullets: [
      "With trusted service providers who support our operations",
      "When required by legal, regulatory, or law-enforcement obligations",
      "As part of mergers, acquisitions, or business restructuring, with appropriate safeguards",
    ],
  },
  {
    title: "Cookies and Tracking",
    paragraphs: [
      "We use cookies and similar technologies to remember preferences, analyze usage trends, and optimize platform performance.",
      "You can control cookie settings through your browser, though disabling certain cookies may affect functionality.",
    ],
  },
  {
    title: "Data Security",
    paragraphs: [
      "We implement administrative, technical, and organizational safeguards to protect data from unauthorized access, disclosure, alteration, or destruction.",
      "While no method is fully risk-free, we continuously review and strengthen our security controls.",
    ],
  },
  {
    title: "User Rights",
    paragraphs: [
      "Depending on applicable law, users may have rights related to their personal data.",
    ],
    bullets: [
      "Request access to personal information",
      "Request correction or update of inaccurate data",
      "Request deletion of personal data where legally permissible",
      "Withdraw consent for specific data processing activities",
    ],
  },
  {
    title: "Data Retention",
    paragraphs: [
      "We retain personal data only for as long as necessary to provide services, fulfill contractual obligations, comply with legal requirements, and resolve disputes.",
    ],
  },
  {
    title: "Third Party Services",
    paragraphs: [
      "Our platform may integrate with third-party tools and analytics services. These providers process data under their own privacy terms and applicable contracts.",
    ],
  },
  {
    title: "Changes to Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy periodically to reflect legal, operational, or product changes.",
      "When material updates occur, we will post the revised version and update the effective date.",
    ],
  },
  {
    title: "Contact Information",
    paragraphs: [
      "For privacy-related questions or requests, contact us at:",
      "privacy@company.com",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        <section className="max-w-4xl mx-auto px-6 py-20">
          <header>
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </header>

          <div className="mt-10 space-y-6">
            {policySections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold mt-10 text-gray-900">{section.title}</h2>

                {section.paragraphs.map((paragraph, idx) => (
                  <p key={`${section.title}-${idx}`} className="mt-4 text-gray-600 leading-relaxed">
                    {section.title === "Contact Information" && paragraph === "privacy@company.com" ? (
                      <a href="mailto:privacy@company.com" className="text-primary hover:underline">
                        privacy@company.com
                      </a>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-600">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

