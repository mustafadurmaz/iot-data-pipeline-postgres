import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import type { IotData } from "./types/iot-data";
import DashboardCard from "./DashboardCard";
import DashboardTable from "./DashboardTable";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = "http://localhost:3000"; // backend

const App: React.FC = () => {
  const [latestData, setLatestData] = useState<IotData[]>([]);
  const [realtimeData, setRealtimeData] = useState<IotData[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get<IotData[]>(
        `${API_BASE_URL}/iot-data/latest`
      );
      setLatestData(response.data);
    } catch (error) {
      console.error("Error fetching latest data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    eventSourceRef.current = new EventSource(`${API_BASE_URL}/iot-data/stream`);

    eventSourceRef.current.onmessage = (event) => {
      const newData: IotData = JSON.parse(event.data);

      setRealtimeData((prevData) => {
        const updated = [newData, ...prevData].slice(0, 50);
        return updated.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    };

    eventSourceRef.current.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSourceRef.current?.close();
    };

    return () => {
      eventSourceRef.current?.close();
    };
  }, [fetchData]);

  // Chart data helper
  const getChartData = (
    data: IotData[],
    key: keyof IotData,
    label: string,
    borderColor: string
  ) => {
    return {
      labels: data.map((d) =>
        new Date(d.timestamp).toLocaleTimeString("tr-TR")
      ),
      datasets: [
        {
          label,
          data: data.map((d) => d[key]),
          borderColor,
          backgroundColor: borderColor + "33",
          tension: 0.3,
          pointRadius: 2,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      x: { title: { display: true, text: "Zaman" } },
      y: { title: { display: true, text: "Değer" } },
    },
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} component="div">
          <DashboardCard
            title="Canlı Sıcaklık"
            icon="🌡️"
            color="#36A2EB"
            unit="°C"
            dataKey="temperature"
            data={realtimeData}
            getChartData={getChartData}
            chartOptions={chartOptions}
          />
        </Grid>
        <Grid item xs={12} md={4} component="div">
          <DashboardCard
            title="Canlı Nem"
            icon="💧"
            color="#4BC0C0"
            unit="%"
            dataKey="humidity"
            data={realtimeData}
            getChartData={getChartData}
            chartOptions={chartOptions}
          />
        </Grid>
        <Grid item xs={12} md={4} component="div">
          <DashboardCard
            title="Canlı Basınç"
            icon="🌀"
            color="#9966FF"
            unit="hPa"
            dataKey="pressure"
            data={realtimeData}
            getChartData={getChartData}
            chartOptions={chartOptions}
          />
        </Grid>
      </Grid>

      <DashboardTable data={latestData} />
    </Container>
  );
};

export default App;
