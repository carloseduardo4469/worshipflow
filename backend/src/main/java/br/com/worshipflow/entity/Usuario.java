package br.com.worshipflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false)
    private String senhaHash;

    @Column(length = 30)
    private String telefone;

    @Column(length = 80)
    private String instrumentoPrincipal;

    @Column(length = 300)
    private String habilidades;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusMinisterio statusMinisterio = StatusMinisterio.ATIVO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PerfilUsuario perfil = PerfilUsuario.MEMBRO;

    @Column(length = 128)
    private String resetTokenHash;

    private LocalDateTime resetTokenExpiraEm;

    @Column(length = 128)
    private String apiTokenHash;

    private LocalDateTime apiTokenExpiraEm;

    @Column(columnDefinition = "TEXT")
    private String fotoPerfil;

    @Column(length = 60)
    private String fotoPerfilTipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ministerio_id")
    private Ministerio ministerio;

    @ManyToMany
    @JoinTable(
            name = "usuario_musicas_favoritas",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "musica_id")
    )
    private Set<Musica> musicasFavoritas = new LinkedHashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getInstrumentoPrincipal() {
        return instrumentoPrincipal;
    }

    public void setInstrumentoPrincipal(String instrumentoPrincipal) {
        this.instrumentoPrincipal = instrumentoPrincipal;
    }

    public String getHabilidades() {
        return habilidades;
    }

    public void setHabilidades(String habilidades) {
        this.habilidades = habilidades;
    }

    public StatusMinisterio getStatusMinisterio() {
        return statusMinisterio;
    }

    public void setStatusMinisterio(StatusMinisterio statusMinisterio) {
        this.statusMinisterio = statusMinisterio;
    }

    public PerfilUsuario getPerfil() {
        return perfil;
    }

    public void setPerfil(PerfilUsuario perfil) {
        this.perfil = perfil;
    }

    public String getResetTokenHash() {
        return resetTokenHash;
    }

    public void setResetTokenHash(String resetTokenHash) {
        this.resetTokenHash = resetTokenHash;
    }

    public LocalDateTime getResetTokenExpiraEm() {
        return resetTokenExpiraEm;
    }

    public void setResetTokenExpiraEm(LocalDateTime resetTokenExpiraEm) {
        this.resetTokenExpiraEm = resetTokenExpiraEm;
    }

    public String getApiTokenHash() {
        return apiTokenHash;
    }

    public void setApiTokenHash(String apiTokenHash) {
        this.apiTokenHash = apiTokenHash;
    }

    public LocalDateTime getApiTokenExpiraEm() {
        return apiTokenExpiraEm;
    }

    public void setApiTokenExpiraEm(LocalDateTime apiTokenExpiraEm) {
        this.apiTokenExpiraEm = apiTokenExpiraEm;
    }

    public String getFotoPerfil() {
        return fotoPerfil;
    }

    public void setFotoPerfil(String fotoPerfil) {
        this.fotoPerfil = fotoPerfil;
    }

    public String getFotoPerfilTipo() {
        return fotoPerfilTipo;
    }

    public void setFotoPerfilTipo(String fotoPerfilTipo) {
        this.fotoPerfilTipo = fotoPerfilTipo;
    }

    public Ministerio getMinisterio() {
        return ministerio;
    }

    public void setMinisterio(Ministerio ministerio) {
        this.ministerio = ministerio;
    }

    public Set<Musica> getMusicasFavoritas() {
        return musicasFavoritas;
    }

    public void setMusicasFavoritas(Set<Musica> musicasFavoritas) {
        this.musicasFavoritas = musicasFavoritas;
    }
}
