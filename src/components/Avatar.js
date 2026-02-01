import { jsx as _jsx } from "react/jsx-runtime";
export default function Avatar({ name }) {
    const letter = (name || 'U').slice(0, 1).toUpperCase();
    return (_jsx("div", { className: "h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm", children: letter }));
}
