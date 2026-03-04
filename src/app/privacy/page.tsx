export default function PrivacyPolicy() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-16 text-zinc-300">
      <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
          <p>
            Doppelganger Connect ("we," "our," or "us") is committed to protecting your privacy and biometric data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our facial matching service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">2. Biometric Data Processing</h2>
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-medium mb-2 text-white">Crucial Information About Your Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-primary">Transient Client-Side Extraction:</strong> Facial analysis and biometric extraction occur exclusively on your device (client-side) using WebAssembly and WebGPU technologies.
              </li>
              <li>
                <strong className="text-primary">No Image Storage:</strong> We do NOT upload, store, or save your original photographs or video streams on our servers. The visual data never leaves your device in its original form.
              </li>
              <li>
                <strong className="text-primary">Vector Representations Only:</strong> We only transmit and store a mathematical vector representation (a 512-dimensional array of numbers) of your facial features. This vector cannot be reverse-engineered to reconstruct your original face image.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">3. Data Retention & Deletion</h2>
          <p className="mb-4">
            In strict adherence to the General Data Protection Regulation (GDPR) storage limitation principle:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              We implement an automated data retention policy that permanently deletes your user record and associated biometric vector <strong>90 days</strong> after its creation.
            </li>
            <li>
              You may request immediate deletion of your data at any time by contacting our support team or using the deletion tools provided in the application.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Usage</h2>
          <p>
            The mathematical vectors we store are used solely for the purpose of calculating similarity scores against other vectors in our database to find your "doppelganger." We do not share, sell, or lease this data to third parties for marketing or surveillance purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">5. International Transfers</h2>
          <p>
            Our services are accessible globally. By using our service, you acknowledge that your anonymized vector data may be processed in data centers located in the United States and other jurisdictions, always protected by high-standard encryption and security measures.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">6. Contact Us</h2>
          <p>
            For any privacy-related concerns or to exercise your data rights, please contact our Data Protection Officer at privacy@doppelganger.connect.
          </p>
        </section>

        <div className="pt-8 text-sm text-zinc-500 border-t border-zinc-800">
          Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </main>
  )
}
