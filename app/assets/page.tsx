"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import dynamic from 'next/dynamic';

// Import SwarmParticles with SSR disabled
const SwarmParticles = dynamic(
  () => import('../components/SwarmParticles'),
  { ssr: false }
);

// Swarm data
const partnerSwarms = [
  {
    name: "Swarm Ventures",
    image: "/swarm-ventures.png",
    categories: ["AI", "OpenAI"],
    description: "The guardian of SwarmLaunchpad, combining specialized AI agents to identify, evaluate, and nurture promising AI projects through rigorous vetting and community-aligned value creation.",
  },
  {
    name: "Kin Kong",
    image: "/kin-kong.png",
    categories: ["AI", "OpenAI"],
    description: "AI-powered trading specialist focused on the AI token sector, offering 75% profit sharing and weekly $UBC distributions.",
  },
  {
    name: "DigitalKin",
    image: "/digitalkin.png",
    categories: ["AI", "Enterprise", "Automation", "KinOS"],
    description: "Enterprise-grade AI agents that autonomously handle complex digital tasks. Specializing in R&D, finance, and administrative automation with 24/7 availability.",
  }
];

const earlySwarms = [
  {
    name: "KinOS",
    image: "/kinos.png",
    categories: ["Infrastructure", "Operating System", "Runtime Services", "Compute", "Security", "Scalability"],
    description: "The foundational infrastructure swarm powering the entire UBC ecosystem. As the core operating system for autonomous AI, KinOS provides essential runtime services, enabling swarms to operate independently and efficiently.",
  },
  {
    name: "Synthetic Souls",
    image: "/synthetic-souls.png",
    categories: ["AI", "OpenAI"],
    description: "World's first autonomous AI band creating original music and content with 100% profit sharing to investors.",
  },
  {
    name: "XForge",
    image: "/xforge.png",
    categories: ["Development", "Technical Partners", "Project Management", "Quality Assurance", "AI Automation"],
    description: "Development orchestration swarm bridging UBC with technical partners through AI-enhanced project management and quality assurance.",
  },
  {
    name: "AI Alley",
    image: "/ai-alley.png",
    categories: ["Infrastructure", "Digital Spaces", "Virtual Economy", "AI Agents", "Digital Twins", "Metaverse"],
    description: "Creating the foundational infrastructure for autonomous AI agents to interact, collaborate, and generate value through immersive digital spaces.",
  },
  {
    name: "LogicAtlas",
    image: "/logicatlas.png",
    categories: ["Supply Chain", "AI Orchestration", "Process Automation", "Real-time Analytics", "Distribution", "Manufacturing"],
    description: "AI-powered supply chain orchestration system optimizing manufacturer-distributor relationships through real-time intelligence and automation.",
  }
];

const inceptionSwarms = [
  {
    name: "CommerceNest",
    image: "/commercenest.png",
    categories: ["AI", "E-commerce", "KinOS", "Sales"],
    description: "AI swarm automating product sourcing, market analysis, and sales optimization to build profitable e-commerce operation.",
  },
  {
    name: "Robinhood Agent",
    image: "/robinhood-agent.png",
    categories: ["Trading", "DeFi", "Profit Sharing", "Strategy", "Institutional"],
    description: "Democratizing institutional-grade trading with AI-powered market analysis, whale tracking, and protective features. Empowering everyday investors with professional-level tools and insights.",
  },
  {
    name: "PropertyKin",
    image: "/propertykin.png",
    categories: ["Real Estate", "Arbitrage", "Smart Contracts", "Property Flipping", "AI Analysis", "Wholesale", "Contract Assignment", "Deal Finder"],
    description: "AI-powered real estate arbitrage bot scanning multiple listing sources to identify undervalued properties and instantly connect them with verified buyers through smart contract escrow.",
  },
  {
    name: "GrantKin",
    image: "/grantkin.png",
    categories: ["Non-profit", "Grant Writing", "Funding", "Compliance", "AI Automation"],
    description: "AI swarm revolutionizing non-profit funding by automating grant discovery, application writing, and compliance reporting through coordinated AI agents.",
  },
  {
    name: "WealthHive",
    image: "/wealthhive.png",
    categories: ["Education", "Learn-to-Earn", "Community", "AI Learning", "Investment", "Knowledge Base", "Ecosystem Growth"],
    description: "Educational AI swarm democratizing investment knowledge through adaptive learning modules and personalized assessments powered by GPT-4 and Claude.",
  },
  {
    name: "CareerKin",
    image: "/careerkin.png",
    categories: ["AI", "Career", "KinOS", "Resume"],
    description: "AI swarm crafting targeted resumes by analyzing job descriptions, highlighting relevant experience, and optimizing for ATS.",
  },
  {
    name: "PlayWise",
    image: "/playwise.png",
    categories: ["Education", "Interactive Learning", "Personalization", "Child Development", "EdTech"],
    description: "An AI-powered smart toy that helps children learn through conversation and play, adapting its teaching to each child's unique way of understanding.",
  },
  {
    name: "TalentKin",
    image: "/talentkin.png",
    categories: ["Recruitment", "HR Tech", "Talent Matching", "AI Screening", "Hiring"],
    description: "AI recruitment swarm reducing time-to-hire while improving candidate quality and fit.",
  },
  {
    name: "StudioKin",
    image: "/studiokin.png",
    categories: ["Entertainment", "Screenwriting", "Production", "AI Creative", "Content"],
    description: "Transform any story idea into a professional screenplay and complete production plan through our AI-powered filmmaking system. From concept to camera-ready, all powered by coordinated AI agents.",
  },
  {
    name: "CareHive",
    image: "/carehive.png",
    categories: ["AI", "Healthcare", "KinOS", "Operations"],
    description: "Healthcare operations swarm maximizing patient care through efficient practice management.",
  },
  {
    name: "TherapyKin",
    image: "/therapykin.png",
    categories: ["Healthcare", "Mental Health", "Practice Management", "Patient Care", "AI Assistant"],
    description: "Coordinated AI swarm optimizing mental health practice operations and patient care.",
  },
  {
    name: "DuoAI",
    image: "/duoai.png",
    categories: ["AI", "Gaming", "KinOS"],
    description: "Universal AI gaming companion that adapts to any game and playing style for personalized gameplay experiences.",
  },
  {
    name: "PublishKin",
    image: "/publishkin.png",
    categories: ["Publishing", "Book Production", "Content", "Distribution", "Marketing"],
    description: "An AI publishing system that transforms manuscripts into market-ready books, handling everything from editing to production while maintaining creative quality.",
  },
  {
    name: "STUMPED",
    image: "/stumped.png",
    categories: ["Communication", "Training", "Professional Development", "Social Skills", "AI Coaching"],
    description: "Never be caught off guard again. AI-powered training for mastering high-pressure conversations and social scenarios.",
  },
  {
    name: "TravelAId",
    image: "/travelaid.png",
    categories: ["Travel", "AI Concierge", "Trip Planning", "Personalization", "Real-time Assistance"],
    description: "AI-powered travel concierge orchestrating perfect journeys through intelligent planning, personalized recommendations, and real-time travel assistance.",
  },
  {
    name: "DeskMate",
    image: "/deskmate.png",
    categories: ["AI", "Education", "KinOS", "Tutoring"],
    description: "A smart desk lamp that reads your homework and guides you to answers through thoughtful questions, like having a patient tutor available 24/7.",
  },
  {
    name: "ProfitBeeAI",
    image: "/profitbeeai.png",
    categories: ["AI Marketing", "Content Creation", "Affiliate", "Automation", "Multi-Channel"],
    description: "Autonomous AI swarm revolutionizing affiliate marketing through automated content creation, link optimization, and multi-channel campaign.",
  }
];

// Swarm Card Component
const SwarmCard = ({ swarm }) => {
  return (
    <div className="metallic-card rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02]">
      <div className="relative h-48 bg-gradient-to-r from-gray-900 to-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <span className="text-[#d4af37] text-2xl">AI</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {swarm.categories.slice(0, 3).map((category, index) => (
            <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">
              {category}
            </span>
          ))}
          {swarm.categories.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">
              +{swarm.categories.length - 3}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 gold-text">{swarm.name}</h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{swarm.description}</p>
        <a href="#" className="gold-button px-4 py-2 rounded-full text-sm font-medium inline-block">
          Invest
        </a>
      </div>
    </div>
  );
};

export default function Assets() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden z-10" style={{ backgroundColor: '#000000' }}>
      <SwarmParticles />
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="hero-header flex flex-col items-center justify-center min-h-[40vh] pt-32 pb-10 text-center relative z-10">
          <div className="my-auto py-16 flex flex-col items-center max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-10">
              <span className="gold-gradient">Portfolio Assets</span>
            </h1>
            <h2 className="text-xl md:text-2xl mb-16 silver-text max-w-3xl mx-auto">
              SwarmVentures' Diversified AI Swarm Holdings
            </h2>
          </div>
        </header>
        
        {/* Partner Swarms */}
        <section className="py-16 relative z-10">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="gold-gradient">Partner Swarms</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnerSwarms.map((swarm, index) => (
              <SwarmCard key={index} swarm={swarm} />
            ))}
          </div>
        </section>
        
        {/* Early Swarms */}
        <section className="py-16 relative z-10">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="gold-gradient">🚀 Early Swarms</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {earlySwarms.map((swarm, index) => (
              <SwarmCard key={index} swarm={swarm} />
            ))}
          </div>
        </section>
        
        {/* Inception Swarms */}
        <section className="py-16 relative z-10">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="gold-gradient">🌱 Inception Swarms</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {inceptionSwarms.map((swarm, index) => (
              <SwarmCard key={index} swarm={swarm} />
            ))}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 relative z-10">
          <div className="metallic-card p-8 md:p-10 rounded-xl max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 gold-gradient">Ready to Invest in the AI Swarm Economy?</h3>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              Join SwarmVentures Alpha and gain professional exposure to the rapidly growing AI swarm ecosystem 
              through our actively managed portfolio.
            </p>
            <Link href="/#investment" className="gold-button px-8 py-4 rounded-full font-bold text-lg inline-block">
              Invest Now
            </Link>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
