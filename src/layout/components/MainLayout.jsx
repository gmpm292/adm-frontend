import { Card } from 'primereact/card';
import { Sidebar } from './Sidebar';
import '../styles/MainLayout.css';

export function MainLayout({ children }) {
    return (
        <div className="layout-wrapper">
            <Sidebar />
            <div className="layout-main">
                <Card className="layout-content">
                    {children}
                </Card>
            </div>
        </div>
    );
} 