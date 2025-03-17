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
        relative border rounded-lg overflow-hidden cursor-pointer transition-all h-full
        ${selected ? 'border-purple-600 border-2' : 'border-gray-300 hover:border-purple-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        max-w-[280px] mx-auto w-full
      `}
      onClick={disabled ? undefined : onSelect}
    >
      <div className="flex flex-col h-full">
        <div className="w-full aspect-square relative bg-gray-100">
          {item.image ? (
            <Image 
              src={item.image} 
              alt={item.name} 
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-400">
              {item.name.charAt(0)}
            </div>
          )}
          {disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          )}
          {selected && (
            <div className="absolute top-2 left-2 h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-3 bg-black text-center">
          <h3 className="font-medium text-white">{item.name}</h3>
        </div>
      </div>
    </div>
  );
} 