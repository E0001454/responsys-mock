export function delay(ms: number = 10): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

const noopLog = () => {}

export const mockCatalogosApi = {
	async getCatalogos(codigo?: string | unknown): Promise<any[]> {
		await delay()
		noopLog()
		const now = new Date()
		const makeDate = (i: number) => new Date(now.getTime() - i * 86400000).toISOString()
		const makeCatalogItem = (id: number, itemCode: string, name: string, dayOffset = 0) => ({
			id,
			bolActivo: true,
			codigo: itemCode,
			nombre: name,
			fecCreacion: makeDate(dayOffset + 1),
			fecUltModificacion: makeDate(dayOffset)
		})

		const lineas = [
			makeCatalogItem(1, 'AFR', 'AFORE', 1),
			makeCatalogItem(2, 'SFM', 'SOFOM', 2),
			makeCatalogItem(3, 'PNS', 'PENSIONES', 3)
		]

		const campanas = [
			makeCatalogItem(1, 'BNV', 'BIENVENIDA', 1),
			makeCatalogItem(2, 'DES', 'DESCUENTOS', 2),
			makeCatalogItem(3, 'CUM', 'CUMPLEAÑOS', 3),
			makeCatalogItem(4, 'PRO', 'PROMOCION', 4),
			makeCatalogItem(5, 'DAU', 'DESCUENTO SEGURO DE AUTO ', 5),
			makeCatalogItem(6, 'DAU', 'DESCUENTO SEGURO DE AUTO ', 6),
			makeCatalogItem(7, 'AFR', 'cujxnajcn', 7),
			makeCatalogItem(8, 'AFR', 'Afore', 8),
			makeCatalogItem(9, 'AFR', 'Afore', 9),
			makeCatalogItem(10, 'AFR', 'Afore', 10)
		]

		const roles = [
			makeCatalogItem(2, 'AS', 'SUPER ADMINISTRADOR', 1),
			makeCatalogItem(3, 'AU', 'ADMINISTRADOR DE USUARIOS', 2),
			makeCatalogItem(4, 'AS', 'ADMINISTRADOR DE SEGURIDAD', 3),
			makeCatalogItem(6, 'LV', 'SOLO LECTURA VISOR', 4)
		]

		const columnasLinea = [
			makeCatalogItem(1, 'NOM', 'NOMBRE', 1)
		]

		const columnasCampana = [
			makeCatalogItem(1, 'NOM', 'NOMBRE', 1)
		]

		const cadenas = [
			makeCatalogItem(1, 'NMR', 'NUMERICO', 1),
			makeCatalogItem(2, 'ALF', 'ALFABETICO', 2),
			makeCatalogItem(3, 'ALN', 'ALFANUMERICO', 3)
		]

		const numeros = [
			makeCatalogItem(1, 'ENT', 'ENTERO', 1),
			makeCatalogItem(2, 'DEC', 'DECIMALES', 2)
		]

		const fechas = [
			makeCatalogItem(1, 'FH1', 'AAAA-MM-DD ', 1)
		]

		const valores = [
			makeCatalogItem(1, 'NMR', 'NUMERICO', 1),
			makeCatalogItem(2, 'CDN', 'CADENA', 2),
			makeCatalogItem(3, 'FCH', 'FECHA', 3)
		]

		const dias = [
			makeCatalogItem(1, 'LNS', 'LUNES', 1),
			makeCatalogItem(2, 'MTS', 'MARTES', 2),
			makeCatalogItem(3, 'MCL', 'MIERCOLES', 3),
			makeCatalogItem(4, 'JVS', 'JUEVES', 4),
			makeCatalogItem(5, 'VNS', 'VIERNES', 5)
		]

		const horas = [
			makeCatalogItem(1, '000', '00:00', 1),
			makeCatalogItem(2, '001', '00:15', 2),
			makeCatalogItem(3, '003', '00:30', 3),
			makeCatalogItem(4, '004', '00:45', 4),
			makeCatalogItem(5, '010', '01:00', 5),
			makeCatalogItem(6, '011', '01:15', 6),
			makeCatalogItem(7, '013', '01:30', 7),
			makeCatalogItem(8, '014', '01:45', 8),
			makeCatalogItem(9, '200', '20:00', 9),
			makeCatalogItem(10, '201', '20:15', 10),
			makeCatalogItem(11, '203', '20:30', 11),
			makeCatalogItem(12, '204', '20:45', 12),
			makeCatalogItem(13, '210', '21:00', 13),
			makeCatalogItem(14, '211', '21:15', 14),
			makeCatalogItem(15, '213', '21:30', 15),
			makeCatalogItem(16, '214', '21:45', 16),
			makeCatalogItem(17, '220', '22:00', 17),
			makeCatalogItem(18, '221', '22:15', 18),
			makeCatalogItem(19, '223', '22:30', 19),
			makeCatalogItem(20, '224', '22:45', 20),
			makeCatalogItem(21, '230', '23:00', 21),
			makeCatalogItem(22, '231', '23:15', 22),
			makeCatalogItem(23, '233', '23:30', 23),
			makeCatalogItem(24, '234', '23:45', 24)
		]

		const ejecuciones = [
			makeCatalogItem(1, 'ATM', 'Automatico', 1),
			makeCatalogItem(2, 'MNL', 'Manual', 2),
			makeCatalogItem(3, 'HBD', 'Hibrido', 3)
		]

		const actividades = [
			makeCatalogItem(1, 'CAG', 'CARGA', 1),
			makeCatalogItem(2, 'VLD', 'VALIDACION', 2),
			makeCatalogItem(3, 'ENV', 'ENVIO', 3),
			makeCatalogItem(4, 'RCP', 'RECEPCION', 4)
		]

		const estatus = [
			makeCatalogItem(1, 'PEN', 'PENDIENTE', 1),
			makeCatalogItem(2, 'PRO', 'PROCESANDO', 2),
			makeCatalogItem(3, 'FIN', 'FINALIZADO', 3)
		]

		const grouped = [
			{ codigo: 'ROL', nombre: 'ROL', registros: roles },
			{ codigo: 'LNN', nombre: 'LINEA_NEGOCIO', registros: lineas },
			{ codigo: 'CMP', nombre: 'CAMPANA', registros: campanas },
			{ codigo: 'CLI', nombre: 'COLUMNA_LINEA', registros: columnasLinea },
			{ codigo: 'CCM', nombre: 'COLUMNA_CAMPANA', registros: columnasCampana },
			{ codigo: 'CLM', nombre: 'COLUMNA', registros: [...columnasLinea, ...columnasCampana] },
			{ codigo: 'VAL', nombre: 'VALOR', registros: valores },
			{ codigo: 'CDN', nombre: 'CADENA', registros: cadenas },
			{ codigo: 'NMR', nombre: 'NUMERO', registros: numeros },
			{ codigo: 'FCH', nombre: 'FECHA', registros: fechas },
			{ codigo: 'DIA', nombre: 'DIA', registros: dias },
			{ codigo: 'HRS', nombre: 'HORA', registros: horas },
			{ codigo: 'EJE', nombre: 'EJECUCION', registros: ejecuciones },
			{ codigo: 'ACT', nombre: 'ACTIVIDAD', registros: actividades },
			{ codigo: 'EST', nombre: 'ESTATUS_TAREA', registros: estatus }
		]

		if (!codigo) return grouped

		const selected = grouped.find(group => String(group.codigo).toUpperCase() === String(codigo).toUpperCase())
		return selected?.registros ?? []
	}
}

export const mockApi = (() => {
	const now = new Date()
	const makeDate = (i: number) => new Date(now.getTime() - i * 86400000).toISOString()

	const mapeosLinea: any[] = Array.from({ length: 20 }).map((_, i) => ({
		idABCConfigMapeoLinea: i + 1,
		idABCCatLineaNegocio: (i % 10) + 1,
		nombre: `Mapeo Línea ${i + 1}`,
		descripcion: `Descripción del mapeo de línea ${i + 1}`,
		bolActivo: i % 4 !== 0,
		validar: i % 2 === 0,
		enviar: i % 3 !== 0,
		dictaminar: i % 4 === 0,
		bolDictaminacion: i % 4 === 0,
		porcentajeError: (i % 11) * 10,
		fecCreacion: makeDate(i + 1),
		idABCUsuarioUltModificacion: 1,
		fecUltModificacion: makeDate(i)
	}))

	const mapeosCampana: any[] = Array.from({ length: 20 }).map((_, i) => ({
		idABCConfigMapeoCampana: i + 1001,
		idABCCatLineaNegocio: (i % 5) + 1,
		idABCCatCampana: 101 + i,
		nombre: `Mapeo Campaña ${i + 1}`,
		descripcion: `Descripción del mapeo de campaña ${i + 1}`,
		bolActivo: i % 3 !== 0,
		validar: i % 2 !== 0,
		enviar: i % 3 !== 0,
		dictaminar: i % 5 === 0,
		bolDictaminacion: i % 5 === 0,
		porcentajeError: (i % 11) * 10,
		fecCreacion: makeDate(i + 1),
		idABCUsuarioUltModificacion: 1,
		fecUltModificacion: makeDate(i)
	}))

	function nextLineaId() {
		return (mapeosLinea.reduce((a, b) => Math.max(a, Number(b.idABCConfigMapeoLinea || 0)), 0) || 0) + 1
	}

	function nextCampanaId() {
		return (mapeosCampana.reduce((a, b) => Math.max(a, Number(b.idABCConfigMapeoCampana || 0)), 0) || 1000) + 1
	}

	return {
		async getAllMapeos(): Promise<any[]> {
			await delay()
			return mapeosLinea.map(x => ({ ...x }))
		},

		async getMapeosByLinea(lineaId: string | number): Promise<any[]> {
			await delay()
			return mapeosLinea.filter(m => Number(m.idABCCatLineaNegocio) === Number(lineaId)).map(x => ({ ...x }))
		},

		async getMapeosCampana(): Promise<any[]> {
			await delay()
			return mapeosCampana.map(x => ({ ...x }))
		},

		async createMapeoLinea(lineaId: string | number, payload: any): Promise<any> {
			await delay()
			const id = nextLineaId()
			const data = payload?.mapeo ?? payload ?? {}
			const created = {
				idABCConfigMapeoLinea: id,
				idABCCatLineaNegocio: Number(lineaId),
				nombre: data.nombre ?? '',
				descripcion: data.descripcion ?? '',
				bolActivo: data.bolActivo === undefined ? true : Boolean(data.bolActivo),
				validar: data.validar ?? true,
				enviar: data.enviar ?? data.envio ?? true,
				dictaminar: data.dictaminar ?? data.bolDictaminacion ?? false,
				bolDictaminacion: data.dictaminar ?? data.bolDictaminacion ?? false,
				porcentajeError:
					data.porcentajeError === null || data.porcentajeError === undefined || Number.isNaN(Number(data.porcentajeError))
						? null
						: Number(data.porcentajeError),
				fecCreacion: new Date().toISOString(),
				idABCUsuarioUltModificacion: payload?.idUsuario ?? 1,
				fecUltModificacion: new Date().toISOString()
			}
			mapeosLinea.unshift(created)
			return { ...created }
		},

		async createMapeoCampana(lineaId: string | number, campanaId: string | number, payload: any): Promise<any> {
			await delay()
			const id = nextCampanaId()
			const data = payload?.mapeo ?? payload ?? {}
			const created = {
				idABCConfigMapeoCampana: id,
				idABCCatLineaNegocio: Number(lineaId),
				idABCCatCampana: Number(campanaId),
				nombre: data.nombre ?? '',
				descripcion: data.descripcion ?? '',
				bolActivo: data.bolActivo === undefined ? true : Boolean(data.bolActivo),
				validar: data.validar ?? true,
				enviar: data.enviar ?? data.envio ?? true,
				dictaminar: data.dictaminar ?? data.bolDictaminacion ?? false,
				bolDictaminacion: data.dictaminar ?? data.bolDictaminacion ?? false,
				porcentajeError:
					data.porcentajeError === null || data.porcentajeError === undefined || Number.isNaN(Number(data.porcentajeError))
						? null
						: Number(data.porcentajeError),
				fecCreacion: new Date().toISOString(),
				idABCUsuarioUltModificacion: payload?.idUsuario ?? 1,
				fecUltModificacion: new Date().toISOString()
			}
			mapeosCampana.unshift(created)
			return { ...created }
		},

		async updateMapeoLinea(payload: any): Promise<any> {
			await delay()
			const data = payload?.mapeo ?? payload ?? {}
			const id = Number(data?.id ?? data?.idABCConfigMapeoLinea ?? 0)
			const idx = mapeosLinea.findIndex(m => Number(m.idABCConfigMapeoLinea) === id)
			if (idx === -1) return {}
			mapeosLinea[idx] = {
				...mapeosLinea[idx],
				nombre: data.nombre ?? mapeosLinea[idx].nombre,
				descripcion: data.descripcion ?? mapeosLinea[idx].descripcion,
				bolActivo: data.bolActivo === undefined ? mapeosLinea[idx].bolActivo : Boolean(data.bolActivo),
				validar: data.validar === undefined ? mapeosLinea[idx].validar : Boolean(data.validar),
				enviar: data.enviar === undefined
					? mapeosLinea[idx].enviar
					: Boolean(data.enviar),
				dictaminar: data.dictaminar === undefined
					? mapeosLinea[idx].dictaminar
					: Boolean(data.dictaminar),
				bolDictaminacion: data.dictaminar === undefined
					? mapeosLinea[idx].bolDictaminacion
					: Boolean(data.dictaminar),
				porcentajeError:
					data.porcentajeError === undefined
						? mapeosLinea[idx].porcentajeError
						: (data.porcentajeError === null || Number.isNaN(Number(data.porcentajeError)) ? null : Number(data.porcentajeError)),
				fecUltModificacion: new Date().toISOString()
			}
			return { ...mapeosLinea[idx] }
		},

		async updateMapeoCampana(payload: any): Promise<any> {
			await delay()
			const data = payload?.mapeo ?? payload ?? {}
			const id = Number(data?.id ?? data?.idABCConfigMapeoCampana ?? 0)
			const idx = mapeosCampana.findIndex(m => Number(m.idABCConfigMapeoCampana) === id)
			if (idx === -1) return {}
			mapeosCampana[idx] = {
				...mapeosCampana[idx],
				nombre: data.nombre ?? mapeosCampana[idx].nombre,
				descripcion: data.descripcion ?? mapeosCampana[idx].descripcion,
				bolActivo: data.bolActivo === undefined ? mapeosCampana[idx].bolActivo : Boolean(data.bolActivo),
				validar: data.validar === undefined ? mapeosCampana[idx].validar : Boolean(data.validar),
				enviar: data.enviar === undefined
					? mapeosCampana[idx].enviar
					: Boolean(data.enviar),
				dictaminar: data.dictaminar === undefined
					? mapeosCampana[idx].dictaminar
					: Boolean(data.dictaminar),
				bolDictaminacion: data.dictaminar === undefined
					? mapeosCampana[idx].bolDictaminacion
					: Boolean(data.dictaminar),
				porcentajeError:
					data.porcentajeError === undefined
						? mapeosCampana[idx].porcentajeError
						: (data.porcentajeError === null || Number.isNaN(Number(data.porcentajeError)) ? null : Number(data.porcentajeError)),
				fecUltModificacion: new Date().toISOString()
			}
			return { ...mapeosCampana[idx] }
		},

		async deleteMapeoLinea(lineaId: string | number, mapeoId: string | number): Promise<void> {
			await delay()
			for (let i = mapeosLinea.length - 1; i >= 0; i--) {
				if (Number(mapeosLinea[i].idABCConfigMapeoLinea) === Number(mapeoId) && Number(mapeosLinea[i].idABCCatLineaNegocio) === Number(lineaId)) {
					mapeosLinea.splice(i, 1)
				}
			}
			return
		},

		async patchActivarMapeoLinea(payload: any): Promise<any> {
			await delay()
			const id = Number(payload?.mapeo?.id ?? 0)
			const item = mapeosLinea.find(m => Number(m.idABCConfigMapeoLinea) === id)
			if (!item) return {}
			item.bolActivo = true
			item.fecUltModificacion = new Date().toISOString()
			return { ...item }
		},

		async patchDesactivarMapeoLinea(payload: any): Promise<any> {
			await delay()
			const id = Number(payload?.mapeo?.id ?? 0)
			const item = mapeosLinea.find(m => Number(m.idABCConfigMapeoLinea) === id)
			if (!item) return {}
			item.bolActivo = false
			item.fecUltModificacion = new Date().toISOString()
			return { ...item }
		},

		async patchActivarMapeoCampana(payload: any): Promise<any> {
			await delay()
			const id = Number(payload?.mapeo?.id ?? 0)
			const item = mapeosCampana.find(m => Number(m.idABCConfigMapeoCampana) === id)
			if (!item) return {}
			item.bolActivo = true
			item.fecUltModificacion = new Date().toISOString()
			return { ...item }
		},

		async patchDesactivarMapeoCampana(payload: any): Promise<any> {
			await delay()
			const id = Number(payload?.mapeo?.id ?? 0)
			const item = mapeosCampana.find(m => Number(m.idABCConfigMapeoCampana) === id)
			if (!item) return {}
			item.bolActivo = false
			item.fecUltModificacion = new Date().toISOString()
			return { ...item }
		},

		async postBitacoraUsuario(_payload: any): Promise<any> { await delay(); return { ok: true } }
	}
})()

export const mockColumnasApi = {
	async getColumnasByMapeo(_mapeoId: string | number): Promise<any[]> { await delay();
		const now = new Date()
		const makeDate = (i: number) => new Date(now.getTime() - i * 86400000).toISOString()
		return Array.from({ length: 20 }).map((_, i) => ({
			idABCConfigMapeoLinea: Number(_mapeoId) || (i + 1),
			idABCCatColumna: i + 1,
			bolActivo: i % 5 !== 0,
			bolCarga: true,
			bolValidacion: i % 2 === 0,
			bolEnvio: i % 3 === 0,
			regex: `^valor_${i + 1}$`,
			fecCreacion: makeDate(i + 1),
			idABCUsuarioUltModificacion: 1,
			fecUltModificacion: makeDate(i)
		})) },
	async getColumnasLinea(): Promise<any[]> { await delay();
		const now = new Date()
		const makeDate = (i: number) => new Date(now.getTime() - i * 86400000).toISOString()
		return Array.from({ length: 20 }).map((_, i) => ({
			idABCConfigMapeoLinea: i + 1,
			idABCCatColumna: i + 1,
			bolActivo: true,
			bolCarga: true,
			bolValidacion: i % 2 === 0,
			bolEnvio: i % 3 === 0,
			regex: `^linea_col_${i + 1}$`,
			fecCreacion: makeDate(i + 1),
			idABCUsuarioUltModificacion: 1,
			fecUltModificacion: makeDate(i)
		})) },
	async getColumnasCampana(): Promise<any[]> { await delay();
		const now = new Date()
		const makeDate = (i: number) => new Date(now.getTime() - i * 86400000).toISOString()
		return Array.from({ length: 20 }).map((_, i) => ({
			idABCConfigMapeoCampana: i + 1001,
			idABCCatColumna: i + 1,
			idABCCatCampana: 101 + (i % 20),
			bolActivo: i % 4 !== 0,
			bolCarga: true,
			bolValidacion: i % 2 === 0,
			bolEnvio: i % 3 === 0,
			regex: `^camp_col_${i + 1}$`,
			fecCreacion: makeDate(i + 1),
			idABCUsuarioUltModificacion: 1,
			fecUltModificacion: makeDate(i)
		})) },
	async getColumnasCampanaByMapeo(_mapeoId: string | number): Promise<any[]> { await delay();
		const now = new Date()
		const makeDate = (i: number) => new Date(now.getTime() - i * 86400000).toISOString()
		return Array.from({ length: 20 }).map((_, i) => ({
			idABCConfigMapeoCampana: Number(_mapeoId) || (i + 1001),
			idABCCatColumna: i + 1,
			idABCCatCampana: 101 + (i % 20),
			bolActivo: i % 4 !== 0,
			bolCarga: true,
			bolValidacion: i % 2 === 0,
			bolEnvio: i % 3 === 0,
			regex: `^camp_map_col_${i + 1}$`,
			fecCreacion: makeDate(i + 1),
			idABCUsuarioUltModificacion: 1,
			fecUltModificacion: makeDate(i)
		})) },
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

