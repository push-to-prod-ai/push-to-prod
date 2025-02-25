import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-xl font-bold">Push to Prod</div>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a 
                href="https://github.com/push-to-prod-ai/push-to-prod" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                Docs
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/push-to-prod-ai/push-to-prod/issues" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                Support
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
