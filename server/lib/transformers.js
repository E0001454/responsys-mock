const ATRIBUTO_TO_KEY = {
  afore: 'descripciondeafore', idcliente: 'customerid', nolote: 'numlote',
  campana: 'idcampana', nombre: 'firstname', apellido: 'lastname',
  lineanegocio: 'lineadenegocio', regimenimss: 'regimenimss'
}

const COLUMNA_TO_KEY = {
  email_address_: 'correo', mobile_number_: 'telefono', mobile_country_: 'telefono2',
  riid_: 'riid', nombre: 'nombre', apellido_paterno: 'apellidopaterno',
  apellido_materno: 'apellidomaterno', linea_de_negocio: 'lineanegocio',
  numero_de_cuenta: 'nocuenta', date_of_birth: 'fechanacimiento',
  postal_street_1_: 'calle1', postal_street_2_: 'calle2', city_: 'ciudad',
  state_: 'estado', postal_code_: 'cp', suspension_logica: 'suspension',
  'usuario prueba': 'prueba', id_afore: 'idafore', descripcion_de_afore: 'descripciondeafore',
  id_cliente_ahorrador: 'idclienteahorrador', id_prestamo_pensionado: 'idprestamopensionado',
  id_susceptible_prestamo: 'idsusceptibleprestamo', tipo_pension: 'tipopension',
  grupo_pago: 'grupopago', customer_id_: 'customerid', num_lote: 'numlote',
  nombre_campana: 'idcampana', id_campana: 'idcampana', id_baja_cambio: 'idbajacambio',
  fecha_baja_cambio: 'fechabajacambio', regimen_imss: 'regimenimss',
  segmento_afo: 'segmentoafo', liga_rsaldos: 'ligarsaldos', segmento_pre: 'segmentopre',
  first_name: 'firstname', last_name: 'lastname', id_comunicacion: 'idcomunicacion',
  domicilio_preferente: 'domiciliopreferente', segmento_proy: 'segmentoproy',
  idpersona: 'idpersona', liga_titular: 'ligatitular', medios_digitales: 'mediosdigitales',
  numero_hijos: 'numerohijos', cuenta_menor_1: 'cuentamenor1', nombre_hijo_1: 'nombrehijo1',
  liga_hijo_1: 'ligahijo1', cuenta_menor_2: 'cuentamenor2', nombre_hijo_2: 'nombrehijo2',
  liga_hijo_2: 'ligahijo2', cuenta_menor_3: 'cuentamenor3', nombre_hijo_3: 'nombrehijo3',
  liga_hijo_3: 'ligahijo3', cuenta_menor_4: 'cuentamenor4', nombre_hijo_4: 'nombrehijo4',
  liga_hijo_4: 'ligahijo4', cuenta_menor_5: 'cuentamenor5', nombre_hijo_5: 'nombrehijo5',
  liga_hijo_5: 'ligahijo5', cuenta_menor_6: 'cuentamenor6', nombre_hijo_6: 'nombrehijo6',
  liga_hijo_6: 'ligahijo6', estatus_exp: 'estatusexp', dom_sucursal: 'domsucursal'
}

function repairDetalleJson(text) {
  let t = text.trim()
  t = t.replace(/([^":,{\[])"\s*"([^":,}\]])/g, '$1, $2')
  t = t.replace(/\}\s*\{/g, '},{')
  if (t.startsWith('{')) t = `[${t}]`
  return t
}

function resolveColumnKeys(d) {
  const attr = (d.atributo ?? '').toLowerCase().trim()
  const col = (d.columna ?? '').toLowerCase().trim()
  const keys = new Set()
  if (attr) { keys.add(attr); if (ATRIBUTO_TO_KEY[attr]) keys.add(ATRIBUTO_TO_KEY[attr]) }
  if (col) { keys.add(col); if (COLUMNA_TO_KEY[col]) keys.add(COLUMNA_TO_KEY[col]) }
  return [...keys]
}

function cleanMsg(v) {
  if (Array.isArray(v)) return v.join(', ')
  let s = String(v ?? '')
  if (s.startsWith('[')) {
    try { const arr = JSON.parse(s); if (Array.isArray(arr)) return arr.join(', ') } catch {}
  }
  return s.replace(/^\[|\]$/g, '').replace(/"/g, '').trim()
}

function parseDetalleMap(text) {
  if (!text) return new Map()
  try {
    const parsed = JSON.parse(repairDetalleJson(text))
    const arr = Array.isArray(parsed) ? parsed
      : (parsed && typeof parsed === 'object') ? [parsed] : []
    const map = new Map()
    for (const d of arr) {
      const keys = resolveColumnKeys(d)
      const msg = cleanMsg(d.error || d.err || '')
      for (const key of keys) {
        if (key) map.set(key, map.has(key) ? `${map.get(key)}, ${msg}` : msg)
      }
    }
    return map
  } catch {
    return new Map()
  }
}

function appendDetalle(val, key, errorMap) {
  const errMsg = errorMap.get(key.toLowerCase())
  if (!errMsg) return val
  const s = String(val ?? '')
  return s ? `${s} (${errMsg})` : errMsg
}

function getEstatusClass(estatus) {
  const c = String(estatus ?? '').toUpperCase()
  if (c === 'ACEPTADO' || c === 'EXITOSO' || c === 'OK') return 'bg-emerald-100 text-emerald-700'
  if (c === 'RECHAZADO' || c === 'ERROR') return 'bg-red-100 text-red-700'
  if (c === 'PENDIENTE' || c === 'EN_PROCESO') return 'bg-blue-100 text-blue-700'
  return 'bg-slate-100 text-slate-600'
}

function enrichCLRecord(row, showDetalle) {
  const errMap = showDetalle ? parseDetalleMap(row.detalle) : new Map()
  const v = (val, key) => showDetalle && errMap.size ? appendDetalle(val, key, errMap) : val
  return {
    ...row,
    estatus: row.estatus ?? '',
    _enriched: true
  }
}

function enrichPETRecord(row, showDetalle) {
  const errMap = showDetalle ? parseDetalleMap(row.detalle) : new Map()
  const v = (val, key) => showDetalle && errMap.size ? appendDetalle(val, key, errMap) : val
  return {
    ...row,
    estatus: row.estatus ?? '',
    _enriched: true
  }
}

function applyValidationErrors(records, tipo, isValidacion = false) {
  if (!isValidacion || tipo !== 'validacion') return records

  const clErrorPatterns = [
    '{"columna":"EMAIL_ADDRESS_","atributo":"correo","error":"no es valido""longitud invalida"}',
    '{"columna":"NOMBRE","atributo":"nombre","error":"vacío"}{"columna":"MOBILE_NUMBER_","atributo":"telefono1","error":"formato incorrecto"}',
    '{"columna":"NUMERO_DE_CUENTA","atributo":"noCuenta","error":"vacío"}{"columna":"NSS","atributo":"nss","error":"longitud invalida"}{"columna":"CURP","atributo":"curp","error":"formato incorrecto"}',
    '{"columna":"RFC","atributo":"rfc","error":"vacío""campo requerido"}'
  ]

  return records.map((r, idx) => {
    const hasError = idx % 3 === 0
    return {
      ...r,
      estatus: hasError ? 'Rechazado' : 'Aceptado',
      detalle: hasError ? clErrorPatterns[idx % clErrorPatterns.length] : ''
    }
  })
}

export { enrichCLRecord, enrichPETRecord, applyValidationErrors, parseDetalleMap, getEstatusClass }
