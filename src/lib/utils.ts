import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// USAGE EXAMPLES /////

// import { cn } from "@/lib/utils";

// // Simple boolean condition
// <div className={cn(
//   "base-classes",
//   isActive && "active-classes"
// )}>

// // Multiple conditions
// <div className={cn(
//   "px-4 py-2 rounded",
//   isLoading && "opacity-50 cursor-not-allowed",
//   isError && "border-red-500 text-red-500",
//   isSuccess && "border-green-500 text-green-500"
// )}>

// interface ButtonProps {
//   variant?: "primary" | "secondary" | "danger";
//   size?: "sm" | "md" | "lg";
//   disabled?: boolean;
//   children: React.ReactNode;
// }

// export function Button({ variant = "primary", size = "md", disabled, children }: ButtonProps) {
//   return (
//     <button
//       className={cn(
//         // Base classes
//         "font-medium rounded transition-colors",

//         // Variant classes
//         {
//           "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
//           "bg-gray-600 text-white hover:bg-gray-700": variant === "secondary",
//           "bg-red-600 text-white hover:bg-red-700": variant === "danger"
//         },

//         // Size classes
//         {
//           "px-2 py-1 text-sm": size === "sm",
//           "px-4 py-2": size === "md",
//           "px-6 py-3 text-lg": size === "lg"
//         },

//         // Disabled state
//         disabled && "opacity-50 cursor-not-allowed hover:bg-current"
//       )}
//       disabled={disabled}
//     >
//       {children}
//     </button>
//   );
// }
