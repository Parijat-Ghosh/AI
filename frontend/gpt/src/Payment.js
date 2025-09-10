export default function Payment() {
    const amount = 100;
    const currency = "INR";
    const receipt = "receipt#1";
    const paymentHandler = async(e) => {
        const response = await fetch("http://localhost:5000/order", {
            method: "POST",
            body: JSON.stringify({amount, currency, receipt}),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const order = await response.json();
        console.log(order);
    }
}