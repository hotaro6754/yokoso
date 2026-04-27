import { BadgeCheck } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

type LegalSection = {
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

const legalSections: LegalSection[] = [
  {
    title: "1. Introduction",
    paragraphs: [
      "These Terms of Service constitute a legal agreement between you and Zodeck regarding access to and use of our website, applications, and related SaaS offerings.",
      "By accessing or using our services, you agree to comply with these terms and all applicable laws and regulations.",
    ],
  },
  {
    title: "2. Definitions",
    paragraphs: [
      "\"Service\" means the Zodeck platform and all related products, websites, and features.",
      "\"User\" means any individual or entity that accesses or uses the Service.",
      "\"Customer Data\" means information submitted to or processed through the Service by users.",
    ],
  },
  {
    title: "3. User Accounts",
    paragraphs: [
      "Users are responsible for maintaining account confidentiality, including login credentials and access controls.",
      "You must provide accurate information during registration and keep account details up to date.",
      "You are responsible for all activities conducted under your account.",
    ],
  },
  {
    title: "4. Acceptable Use Policy",
    paragraphs: [
      "When using the Service, users must not:",
    ],
    listItems: [
      "Misuse, disrupt, or interfere with platform operations",
      "Violate applicable laws, regulations, or third-party rights",
      "Attempt unauthorized access to systems, networks, or data",
      "Upload, distribute, or transmit malicious code or harmful software",
    ],
  },
  {
    title: "5. Intellectual Property",
    paragraphs: [
      "All rights, title, and interest in the Service, including software, trademarks, brand assets, and documentation, remain the exclusive property of Zodeck and its licensors.",
      "No license or ownership rights are transferred except as expressly granted in these terms.",
    ],
  },
  {
    title: "6. Subscription & Payments",
    paragraphs: [
      "Paid features may require a subscription under selected billing plans.",
      "Fees, billing frequency, renewals, and payment terms are governed by the applicable order or pricing plan accepted by you.",
      "Failure to make timely payments may result in suspension or termination of access.",
    ],
  },
  {
    title: "7. Service Availability",
    paragraphs: [
      "We strive to provide reliable and high-availability services; however, uninterrupted or error-free operation cannot be guaranteed.",
      "Scheduled maintenance, upgrades, and third-party dependencies may affect service availability from time to time.",
    ],
  },
  {
    title: "8. Data Protection",
    paragraphs: [
      "We apply technical and organizational safeguards to protect customer data from unauthorized access, misuse, and loss.",
      "Data processing is governed by our Privacy Policy and applicable contractual terms.",
    ],
  },
  {
    title: "9. Third Party Services",
    paragraphs: [
      "The Service may integrate with third-party services and tools for analytics, communication, or workflow enhancement.",
      "Use of third-party services is subject to their independent terms and privacy practices.",
    ],
  },
  {
    title: "10. Termination",
    paragraphs: [
      "We may suspend or terminate accounts that violate these terms, applicable laws, or pose security risks.",
      "Users may discontinue use at any time, subject to any contractual commitments under active subscriptions.",
    ],
  },
  {
    title: "11. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, Zodeck shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the Service.",
      "Our aggregate liability in connection with the Service is limited to fees paid for the relevant subscription period, unless otherwise required by law.",
    ],
  },
  {
    title: "12. Indemnification",
    paragraphs: [
      "You agree to indemnify and hold Zodeck harmless from claims, losses, and expenses arising from your use of the Service, violation of these terms, or infringement of third-party rights.",
    ],
  },
  {
    title: "13. Changes to Terms",
    paragraphs: [
      "We may revise these Terms of Service periodically to reflect legal, operational, or product updates.",
      "Material updates will be posted on this page and become effective based on the published update date.",
    ],
  },
  {
    title: "14. Governing Law",
    paragraphs: [
      "These terms are governed by and construed in accordance with applicable laws of India, and disputes shall be subject to the competent courts in Hyderabad, Telangana.",
    ],
  },
  {
    title: "15. Contact Information",
    paragraphs: [
      "For legal inquiries regarding this agreement, contact:",
      "legal@company.com",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        <section className="max-w-4xl mx-auto px-6 py-20">
          <header className="flex items-start gap-6">
            <div className="rounded-full border border-gray-200 p-4 bg-gray-50 shrink-0">
              <BadgeCheck className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Please read this legal agreement carefully before using the Zodeck platform and related services.
              </p>
            </div>
          </header>

          <div className="mt-10 space-y-6">
            {legalSections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold mt-10 text-gray-900">{section.title}</h2>

                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.title}-${index}`} className="mt-4 text-gray-600 leading-relaxed">
                    {section.title === "15. Contact Information" && paragraph === "legal@company.com" ? (
                      <a href="mailto:legal@company.com" className="text-primary hover:underline">
                        legal@company.com
                      </a>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}

                {section.listItems && (
                  <ol className="mt-4 list-decimal pl-6 space-y-2 text-gray-600">
                    {section.listItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
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

