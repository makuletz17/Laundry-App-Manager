export function getStatusLabel(service: {
  isFinished: boolean;
  isPaid: boolean;
  isClaimed: boolean;
}) {
  const status: string[] = [];

  status.push(service.isFinished ? "Finished" : "Pending");
  status.push(service.isPaid ? "Paid" : "Unpaid");

  if (service.isFinished) {
    status.push(service.isClaimed ? "Claimed" : "Unclaimed");
  }

  return status.join(", ");
}

export const getStatusStyle = (service: any) => {
  if (!service.isFinished) return { backgroundColor: "#FFA000" };
  if (service.isPaid && service.isClaimed)
    return { backgroundColor: "#4CAF50" };
  if (!service.isPaid && service.isClaimed)
    return { backgroundColor: "#7B1FA2" };
  if (service.isPaid && !service.isClaimed)
    return { backgroundColor: "#42A5F5" };
  return { backgroundColor: "#D32F2F" };
};

export const getAmountStyle = (item: any) => {
  if (!item.isPaid) {
    return { color: "#DC2626" }; // red
  }
  return { color: "#16A34A" }; // green
};
