import React from 'react';
import { Chart } from 'primereact/chart';
import './Analytics.css'; // Importar estilos específicos

export function Analytics() {
    // Datos para los gráficos de pastel
    const pieData1 = {
        labels: ['Producto A', 'Producto B', 'Producto C'],
        datasets: [
            {
                data: [300, 150, 200],
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
            }
        ]
    };

    const pieData2 = {
        labels: ['Región Norte', 'Región Sur', 'Región Este'],
        datasets: [
            {
                data: [400, 300, 350],
                backgroundColor: ['#26C6DA', '#FFA726', '#66BB6A']
            }
        ]
    };

    // Datos para el gráfico de líneas
    const lineData = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
            {
                label: 'Visitas 2024',
                data: [540, 725, 850, 949, 1200, 1380],
                fill: false,
                borderColor: '#42A5F5',
                tension: 0.4
            }
        ]
    };

    const options = {
        maintainAspectRatio: false, // Para que el gráfico no mantenga una relación de aspecto fija
        plugins: {
            title: {
                display: true,
                text: 'Visitas a lo largo del tiempo',
                font: { size: 14 }
            }
        }
    };

    return (
        <div className="analytics-page">
            <h1>Panel de Análisis</h1>

            {/* Dos gráficos de pastel arriba */}
            <div className="grid">
                <div className="col-12 md:col-6">
                    <div className="card small-chart">
                        <Chart type="pie" data={pieData1} options={options} />
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="card small-chart">
                        <Chart type="pie" data={pieData2} options={options} />
                    </div>
                </div>
            </div>

            {/* Un gráfico de líneas abajo */}
            <div className="grid mt-4">
                <div className="col-12">
                    <div className="card large-chart">
                        <Chart type="line" data={lineData} options={options} />
                    </div>
                </div>
            </div>
        </div>
    );
}