function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
const InitialAvatar = ({ name, size }: { name: string , size: number}) => {
  const initials = getInitials(name);

  return (
       <div
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35, // Adjust text size relative to avatar size
      }}
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 text-white font-semibold"
    >
      {initials}
    </div>
  );
};
export default InitialAvatar;