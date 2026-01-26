export function delay(ms: number = 10): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

const noopLog = () => {}

export const mockCatalogosApi = {
	async getCatalogos(_codigo: string | unknown): Promise<any[]> {
		await delay()
		noopLog()
		return []
	}
}

export const mockApi = {
	async getAllMapeos(): Promise<any[]> { await delay(); return [] },
	async getMapeosByLinea(_lineaId: string | number): Promise<any[]> { await delay(); return [] },
	async getMapeosCampana(): Promise<any[]> { await delay(); return [] },
	async createMapeoLinea(_lineaId: string | number, _payload: any): Promise<any> { await delay(); return {} },
	async createMapeoCampana(_lineaId: string | number, _campanaId: string | number, _payload: any): Promise<any> { await delay(); return {} },
	async updateMapeoLinea(_payload: any): Promise<any> { await delay(); return {} },
	async updateMapeoCampana(_payload: any): Promise<any> { await delay(); return {} },
	async deleteMapeoLinea(_lineaId: string | number, _mapeoId: string | number): Promise<void> { await delay(); return },
	async patchActivarMapeoLinea(_payload: any): Promise<any> { await delay(); return {} },
	async patchDesactivarMapeoLinea(_payload: any): Promise<any> { await delay(); return {} },
	async patchActivarMapeoCampana(_payload: any): Promise<any> { await delay(); return {} },
	async patchDesactivarMapeoCampana(_payload: any): Promise<any> { await delay(); return {} },
	async postBitacoraUsuario(_payload: any): Promise<any> { await delay(); return { ok: true } }
}

export const mockColumnasApi = {
	async getColumnasByMapeo(_mapeoId: string | number): Promise<any[]> { await delay(); return [] },
	async getColumnasLinea(): Promise<any[]> { await delay(); return [] },
	async getColumnasCampana(): Promise<any[]> { await delay(); return [] },
	async getColumnasCampanaByMapeo(_mapeoId: string | number): Promise<any[]> { await delay(); return [] },
	async createColumnaCampanaGlobal(_payload: any): Promise<any> { await delay(); return {} },
	async createColumnaLinea(_mapeoId: string | number, _payload: any): Promise<any> { await delay(); return {} },
	async updateColumnaLinea(_payload: any): Promise<any> { await delay(); return {} },
	async patchActivarColumnaLinea(_payload: any): Promise<any> { await delay(); return {} },
	async patchDesactivarColumnaLinea(_payload: any): Promise<any> { await delay(); return {} },
	async createColumnaCampana(_mapeoId: string | number, _payload: any): Promise<any> { await delay(); return {} },
	async updateColumnaCampana(_payload: any): Promise<any> { await delay(); return {} },
	async patchActivarColumnaCampana(_payload: any): Promise<any> { await delay(); return {} },
	async patchDesactivarColumnaCampana(_payload: any): Promise<any> { await delay(); return {} },
	async postBitacoraUsuario(_payload: any): Promise<any> { await delay(); return { ok: true } }
}

