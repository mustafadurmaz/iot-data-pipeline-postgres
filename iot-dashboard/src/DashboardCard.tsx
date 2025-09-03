import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";
import { Line } from "react-chartjs-2";
import type { IotData } from "./types/iot-data";


interface DashboardCardProps {
    title: string;
    icon: string;
    color: string;
    unit: string;
    dataKey: keyof IotData;
    data: IotData[];
    getChartData: (
      data: IotData[],
      key: keyof IotData,
      label: string,
      color: string
    ) => any;
    chartOptions: any;
  }

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  color,
  unit,
  dataKey,
  data,
  getChartData,
  chartOptions,
}) => {
  const latest = data.length > 0 ? data[data.length - 1][dataKey] : null;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={
          <Typography variant="h6" color="text.primary">
            {icon} {title}
          </Typography>
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {latest !== null ? (
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: color, mb: 2 }}
          >
            {latest} {unit}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Veri bekleniyor...
          </Typography>
        )}
        <Box sx={{ height: 200 }}>
          <Line
            data={getChartData(data, dataKey, `${title} ${unit}`, color)}
            options={chartOptions}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
