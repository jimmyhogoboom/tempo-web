type UUID = `${string}-${string}-${string}-${string}-${string}`;
interface ICrypto {
	randomUUID: () => UUID;
}
