import { Link } from 'react-router-dom';

const Navbar = () => (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold tracking-tight">ShopMaster <span className="text-emerald-400">POS</span></h1>
        <div className="space-x-6">
            <Link to="/" className="hover:text-emerald-400 transition">Sales Terminal</Link>
            <Link to="/admin" className="hover:text-emerald-400 transition">Inventory Admin</Link>
            <Link to="/analytics" className="hover:text-emerald-400 transition">Insights</Link>
        </div>
    </nav>
);
export default Navbar;