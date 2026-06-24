async function main() {
    const list = await fetch("http://127.0.0.1:3001/api/v1/proposals").then(r => r.json());
    console.log("Proposals list length:", list.proposals?.length);
    if (list.proposals?.length > 0) {
        const p1 = list.proposals[0].id;
        console.log("Fetching detail for", p1);
        const detailRes = await fetch(`http://127.0.0.1:3001/api/v1/proposals/${p1}`);
        const status = detailRes.status;
        const detail = await detailRes.json();
        console.log("Status:", status);
        console.log("Detail output:", detail);
    }
}
main().catch(console.error);
