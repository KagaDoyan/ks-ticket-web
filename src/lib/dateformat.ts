export default function formatDate(date:string) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date');
    }
    return d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}