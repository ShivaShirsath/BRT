export function SimpleTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section className="window-section">
      <h2>{title}</h2>
      <div className="table-wrap scrollable-y">
        <table>
          <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={`${i}-${j}`}>{cell}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
