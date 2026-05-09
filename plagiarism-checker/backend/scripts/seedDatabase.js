import mongoose from 'mongoose';
import { Document } from '../src/models/Document.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleDocuments = [
  {
    title: "The Future of Automation and IIoT",
    content: `The future of automation is here. Evolutions in technology and the market are driving the IIoT and redefining automation. Schneider Electric delivers a new vision for the Future of Automation that unlocks new business models and a huge potential. New industrial automation system topologies turn industrial automation into a Profit Engine of your business with EcoStruxure. Improve operational profitability in a measurable, safe and sustainable way. Our technology and real-world IIoT expertise can help you shift from managing your business to controlling it. With an empowered workforce and optimized industrial assets, you can maximize not only process efficiency, but also safety, reliability and even profitability of your operations, in real time. Start converting your connected products and existing automation and control systems into the Profit Engine of your business. You will be able to stop managing your performance on a monthly or other artificial schedule and actually control it in real time. This is the Future of Automation.`,
    source: "sample_corpus",
    tags: ["automation", "IIoT", "Schneider Electric"]
  },
  {
    title: "EcoStruxure Plant and Smart Control",
    content: `EcoStruxure Plant represents the future of industrial automation. We innovate to empower the industrial workforce and to optimize every industrial asset and asset set. The best connected products provide advanced process data for smarter operations. What will the future of automation look like for my operations, for my business? It will be extremely exciting. Automation platforms will become much more agile and flexible, enabling them to align with customer architectures. The control functionality delivered on the automation systems will extend to cover new, real-time control domains, such as reliability, safety and profitability, leading to autonomous industrial assets. Traditional control strategies have primarily focused on improving the efficiency of industrial processes. This level of control is a prerequisite to the extended control that will become part of the next generation of smart control.`,
    source: "sample_corpus",
    tags: ["EcoStruxure", "smart control", "industrial automation"]
  },
  {
    title: "Industrial Workforce and Asset Optimization",
    content: `The industrial workforce has become much more sophisticated over time through interaction with industrial operations through automation systems. The workforce has had views of the industrial operations that never previously were possible and the expanded level of information provided by the automation systems has resulted in new levels of experiential learning. The workforce of the future will have even greater information content, resulting in even greater levels of learning which will make them the hub around which industrial operations will perform. Industrial enterprises and plants are comprised of a hierarchy of assets, each of which must perform optimally to maximize the business value of the operation safely. The impact will be never-before-experienced levels of operational profitability from industrial plants which will be continuously measured and controlled for each asset and asset set in the operation through embedded real-time accounting systems.`,
    source: "sample_corpus",
    tags: ["workforce", "assets", "optimization"]
  },
  {
    title: "Profitable Safety and Protected Investment",
    content: `Safety and security are crucial in protecting industrial operations. One of the base components of the Profit Engine concept is Profitable Safety. The Profit Engine brings plant safety to a higher level and ensures that management, with a primary focus on profits, understands that better safety leads to greater profitability. This will help drive true safety cultures throughout industry. Are today's control systems obsolete? How do I protect my existing investments during the transformation? Schneider Electric has made a commitment to future-proof automation and will live up to that commitment. In fact, the Profit Engine approach will build on the excellence that has been installed in industrial plants through existing automation systems, but expand the control domain to drive greater levels of operational profitability safely and sustainably.`,
    source: "sample_corpus",
    tags: ["safety", "investment", "profitability"]
  },
  {
    title: "Schneider Electric Company Profile",
    content: `Schneider Electric develops connected technologies and solutions to manage energy and process in ways that are safe, reliable, efficient and sustainable. The Group invests in R&D in order to sustain innovation and differentiation, with a strong commitment to sustainable development. Our technologies ensure that Life Is On everywhere, for everyone and at every moment. Schneider Electric is the global specialist in energy management and automation. The global specialist in energy management and automation develops connected technologies and solutions to manage energy and process in ways that are safe, reliable, efficient and sustainable. The Group invests in R&D in order to sustain innovation and differentiation, with a strong commitment to sustainable development.`,
    source: "sample_corpus",
    tags: ["Schneider Electric", "energy management", "sustainability"]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
    console.log('Connected to MongoDB');

    // Clear existing sample documents
    await Document.deleteMany({ source: 'sample_corpus' });
    console.log('Cleared existing sample documents');

    // Insert sample documents
    const insertedDocs = await Document.insertMany(sampleDocuments);
    console.log(`Inserted ${insertedDocs.length} sample documents`);

    // Display inserted documents
    insertedDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title} (${doc.metadata.wordCount} words)`);
    });

    console.log('\nDatabase seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();
