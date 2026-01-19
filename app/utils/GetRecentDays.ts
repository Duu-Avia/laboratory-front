export function RecentDay(){
    const today = new Date();
    const thirtyDayAgo = new Date()
    thirtyDayAgo.setDate(today.getDate() - 30);
    
  return {thirtyDayAgo: thirtyDayAgo.toISOString().slice(0,10),today:today.toISOString().slice(0,10)}
}