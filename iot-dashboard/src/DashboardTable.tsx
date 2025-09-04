import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
  } from "@mui/material";
  import type { IotData } from "./types/iot-data";
  
  interface DashboardTableProps {
    data: IotData[];
  }
  
  const DashboardTable: React.FC<DashboardTableProps> = ({ data }) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>ID</TableCell> */}
              <TableCell>Sensör ID</TableCell>
              <TableCell>Sıcaklık (°C)</TableCell>
              <TableCell>Nem (%)</TableCell>
              <TableCell>Basınç (hPa)</TableCell>
              <TableCell>Zaman Damgası</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {/* <TableCell>{row.id}</TableCell> */}
                <TableCell>{row.sensorId}</TableCell>
                <TableCell sx={{ color: "blue" }}>{row.temperature}</TableCell>
                <TableCell sx={{ color: "green" }}>{row.humidity}</TableCell>
                <TableCell sx={{ color: "purple" }}>{row.pressure}</TableCell>
                <TableCell>
                  {new Date(row.timestamp).toLocaleString("tr-TR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  export default DashboardTable;
  