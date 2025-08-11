import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  alt,
  width = 40,
  height = 40,
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        width={width}
        height={height}
        className="rounded-full"
      />
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '?';
    const nameParts = name.trim().split(' ');
    const lastName = nameParts[nameParts.length - 1];
    return lastName.charAt(0).toUpperCase();
  };

  const getRandomColor = (str: string) => {
    const colors = [
      'bg-red-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
      'bg-lime-500',
      'bg-fuchsia-500',
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return colors[hash % colors.length];
  };

  const initial = getInitials(name);
  const colorClass = getRandomColor(name);

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${colorClass}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
