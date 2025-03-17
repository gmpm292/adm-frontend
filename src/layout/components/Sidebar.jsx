import { useState } from 'react';
import { Button } from 'primereact/button';
import { PanelMenu } from 'primereact/panelmenu';
import '../styles/Sidebar.css';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);  // Inicialmente contraído

    const menuItems = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            items: [
                {
                    label: 'Analytics',
                    icon: 'pi pi-chart-line',
                },
                {
                    label: 'Sales',
                    icon: 'pi pi-dollar'
                }
            ]
        },
        {
            label: 'Usuarios',
            icon: 'pi pi-users',
            items: [
                {
                    label: 'Gestión',
                    icon: 'pi pi-cog',
                    items: [
                        {
                            label: 'Crear Usuario',
                            icon: 'pi pi-user-plus'
                        },
                        {
                            label: 'Listar Usuarios',
                            icon: 'pi pi-list'
                        }
                    ]
                },
                {
                    label: 'Roles',
                    icon: 'pi pi-shield',
                    items: [
                        {
                            label: 'Administrador',
                            icon: 'pi pi-star'
                        },
                        {
                            label: 'Usuario',
                            icon: 'pi pi-user'
                        }
                    ]
                }
            ]
        },
        {
            label: 'Configuración',
            icon: 'pi pi-cog',
            items: [
                {
                    label: 'Sistema',
                    icon: 'pi pi-desktop'
                },
                {
                    label: 'Seguridad',
                    icon: 'pi pi-shield'
                }
            ]
        }
    ];

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <Button 
                    icon={collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'}
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-button-text"
                />
            </div>
            <div className="sidebar-content">
                <PanelMenu 
                    model={menuItems} 
                    className={`sidebar-menu ${collapsed ? 'icons-only' : ''}`}
                />
            </div>
        </div>
    );
} 