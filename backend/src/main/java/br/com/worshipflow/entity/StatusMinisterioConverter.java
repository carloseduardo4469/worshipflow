package br.com.worshipflow.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StatusMinisterioConverter implements AttributeConverter<StatusMinisterio, String> {

    @Override
    public String convertToDatabaseColumn(StatusMinisterio status) {
        return status == null ? StatusMinisterio.ATIVO.name() : status.name();
    }

    @Override
    public StatusMinisterio convertToEntityAttribute(String status) {
        if ("INATIVO".equalsIgnoreCase(status)
                || "EM_PAUSA".equalsIgnoreCase(status)
                || "BLOQUEADO".equalsIgnoreCase(status)
                || "DESLIGADO".equalsIgnoreCase(status)) {
            return StatusMinisterio.INATIVO;
        }
        return StatusMinisterio.ATIVO;
    }
}
