import { api } from '@/services/api'
import type {
  ReporteTipo,
  ReporteGeneralTipo,
  RegistroCL,
  RegistroPET,
  RegistroGeneral
} from '@/types/reportes/reporte'
import {
  unwrapRegistros,
  normalizeRegistroCL,
  normalizeRegistroPET,
  normalizeRegistroGeneral
} from '@/adapters/reportes/reporte.adapter'

export const reporteService = {
  async getCL(
    tipo: ReporteTipo,
    filtros: Record<string, string>
  ): Promise<RegistroCL[]> {
    const response =
      tipo === 'carga' ? await api.getReporteCLCarga(filtros)
      : tipo === 'validacion' ? await api.getReporteCLValidacion(filtros)
      : await api.getReporteCLEnvio(filtros)
    return unwrapRegistros<RegistroCL>(response).map(normalizeRegistroCL)
  },

  async getPET(
    tipo: ReporteTipo,
    filtros: Record<string, string>
  ): Promise<RegistroPET[]> {
    const response =
      tipo === 'carga' ? await api.getReportePETCarga(filtros)
      : tipo === 'validacion' ? await api.getReportePETValidacion(filtros)
      : await api.getReportePETEnvio(filtros)
    return unwrapRegistros<RegistroPET>(response).map(normalizeRegistroPET)
  },

  async getGeneralCL(
    tipo: ReporteGeneralTipo,
    filtros: Record<string, string>
  ): Promise<RegistroGeneral[]> {
    const response =
      tipo === 'carga'
        ? await api.getReporteGeneralCLCarga(filtros)
        : tipo === 'envio'
          ? await api.getReporteGeneralCLEnvio(filtros)
          : await api.getReporteGeneralCLValidacion(filtros)
    return unwrapRegistros<RegistroGeneral>(response).map(normalizeRegistroGeneral)
  },

  async getGeneralPET(
    tipo: ReporteGeneralTipo,
    filtros: Record<string, string>
  ): Promise<RegistroGeneral[]> {
    const response =
      tipo === 'carga'
        ? await api.getReporteGeneralPETCarga(filtros)
        : tipo === 'envio'
          ? await api.getReporteGeneralPETEnvio(filtros)
          : await api.getReporteGeneralPETValidacion(filtros)
    return unwrapRegistros<RegistroGeneral>(response).map(normalizeRegistroGeneral)
  }
}
