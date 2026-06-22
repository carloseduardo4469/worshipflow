package br.com.worshipflow.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class PerfilUsuarioConverter implements AttributeConverter<PerfilUsuario, String> {

    @Override
    public String convertToDatabaseColumn(PerfilUsuario perfil) {
        return PerfilUsuario.ADMIN.equals(perfil) ? "ADMIN" : "MEMBRO";
    }

    @Override
    public PerfilUsuario convertToEntityAttribute(String perfil) {
        return "ADMIN".equalsIgnoreCase(perfil) ? PerfilUsuario.ADMIN : PerfilUsuario.USER;
    }
}
