"use client";

import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold gold-gradient mb-4">SwarmVentures</h2>
            <p className="silver-text mb-4 max-w-md">
              Professional Portfolio Management for AI Swarms, offering investors access to diversified 
              swarm share investments through a single managed vehicle.
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-[#d4af37] transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-[#d4af37] transition-colors"
                aria-label="Discord"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-[#d4af37] transition-colors"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold gold-text mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learn-more" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  Learn More
                </Link>
              </li>
              <li>
                <Link href="#investment" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  Investment
                </Link>
              </li>
              <li>
                <Link href="#register" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  Invest
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold gold-text mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#terms" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#privacy" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#disclaimer" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  Risk Disclaimer
                </Link>
              </li>
              <li>
                <Link href="#cookies" className="text-gray-400 hover:text-[#d4af37] transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {currentYear} SwarmVentures. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2 md:mt-0">
            Designed with <span className="text-[#d4af37]">♦</span> for the AI Swarm Economy
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
