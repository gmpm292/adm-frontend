import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { PanelMenu } from 'primereact/panelmenu';
import '../styles/Sidebar.css';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        {
            label: 'Panel Principal',
            icon: 'pi pi-home',
            items: [
                {
                    label: 'Análisis',
                    icon: 'pi pi-chart-line',
                    command: () => navigate('/statistics/analytics')
                },
                {
                    label: 'Ventas',
                    icon: 'pi pi-dollar',
                    command: () => navigate('/statistics/sales')
                }
            ]
        },
        // {
        //     label: 'Usuarios',
        //     icon: 'pi pi-users',
        //     items: [
        //         {
        //             label: 'Gestión',
        //             icon: 'pi pi-cog',
        //             items: [
        //                 {
        //                     label: 'Crear Usuario',
        //                     icon: 'pi pi-user-plus'
        //                 },
        //                 {
        //                     label: 'Listar Usuarios',
        //                     icon: 'pi pi-list'
        //                 }
        //             ]
        //         },
        //         {
        //             label: 'Roles',
        //             icon: 'pi pi-shield',
        //             items: [
        //                 {
        //                     label: 'Administrador',
        //                     icon: 'pi pi-star'
        //                 },
        //                 {
        //                     label: 'Usuario',
        //                     icon: 'pi pi-user'
        //                 }
        //             ]
        //         }
        //     ]
        // },
        {
            label: 'Usuarios',
            icon: 'pi pi-users',
            items: [
                {
                    label: 'Lista de Usuarios',
                    icon: 'pi pi-list',
                    command: () => navigate('/users')
                },
                {
                    label: 'Crear Usuario',
                    icon: 'pi pi-user-plus',
                    command: () => navigate('/users/create')
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