import { IdentityProvider } from "../types";

// Mock IdP Store
let idps: IdentityProvider[] = [
    {
        id: 'idp_1',
        name: 'Corporate Okta',
        type: 'OIDC',
        issuerUrl: 'https://dev-123456.okta.com',
        clientId: '0oab1c2d3e4f5g6h7',
        status: 'ACTIVE',
        lastSync: Date.now() - 3600000
    }
];

export const getIdPs = async (): Promise<IdentityProvider[]> => {
    return [...idps];
};

export const saveIdP = async (idp: IdentityProvider): Promise<void> => {
    const exists = idps.find(i => i.id === idp.id);
    if (exists) {
        idps = idps.map(i => i.id === idp.id ? idp : i);
    } else {
        idps.push(idp);
    }
};

export const deleteIdP = async (id: string): Promise<void> => {
    idps = idps.filter(i => i.id !== id);
};

export const simulateSSOLogin = async (idpId: string): Promise<boolean> => {
    // Simulate redirect flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
};