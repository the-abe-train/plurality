import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions, ChartDataset, ChartData } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options: ChartOptions = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: "Number of players by score",
      font: {
        family: "Kanit",
        size: 14,
        weight: "normal",
      },
      color: "#2B1628",
    },
    legend: {
      display: false,
    },
  },
  color: "#2B1628",
  borderColor: "#2B1628",
  backgroundColor: "white",
};

type Props = {
  data: Record<string, number>;
  userData: {
    guessesToWin: number;
    bin: string;
    win: boolean;
  };
};

export default function Histogram({ data, userData }: Props) {
  const labels = Object.keys(data);
  const values = labels.map((label) => data[label]);
  const userColour = userData.win ? "#04BA10" : "#C43661";
  const barColours = labels.map((label) => {
    return label === userData.bin ? userColour : "#6D2F80";
  });

  // const userDataValues = values.map(value => {
  //   return
  // })

  const dataset: ChartDataset<"bar"> = {
    label: "Scores",
    data: values,
    backgroundColor: barColours,
  };
  // const userDataset: ChartDataset<"bar"> = {
  //   label: "User",
  //   data: userValues,
  //   backgroundColor: "green",
  // };
  const chartData: ChartData<"bar"> = {
    labels,
    datasets: [dataset],
  };
  return <Bar options={options} data={chartData} height={250} />;
}
