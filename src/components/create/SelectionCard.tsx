import Image from 'next/image';

interface SelectionCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    image?: string;
  };
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export default function SelectionCard({ 
  item, 
  selected, 
  onSelect, 
  disabled = false 
}: SelectionCardProps) {
  return (
    <div 
      className={`
        relative border rounded-lg p-4 cursor-pointer transition-all
        ${selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={disabled ? undefined : onSelect}
    >
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 mb-3 relative overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
          {item.image ? (
            <Image 
              src={item.image} 
              alt={item.name} 
              width={96} 
              height={96} 
              className="object-cover"
            />
          ) : (
            <div className="text-4xl text-gray-400">{item.name.charAt(0)}</div>
          )}
        </div>
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        {item.description && (
          <p className="mt-1 text-sm text-gray-500 text-center">{item.description}</p>
        )}
        {disabled && (
          <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
            Coming Soon
          </span>
        )}
        {selected && (
          <div className="absolute top-2 right-2 h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
} 