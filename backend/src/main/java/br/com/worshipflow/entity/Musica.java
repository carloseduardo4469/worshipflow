package br.com.worshipflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "musicas")
public class Musica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 140)
    private String titulo;

    @Column(length = 120)
    private String artista;

    @Column(length = 12)
    private String tonalidade;

    private Integer bpm;

    @Column(length = 80)
    private String categoria;

    @Column(length = 500)
    private String linkCifra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ministerio_id")
    private Ministerio ministerio;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getArtista() {
        return artista;
    }

    public void setArtista(String artista) {
        this.artista = artista;
    }

    public String getTonalidade() {
        return tonalidade;
    }

    public void setTonalidade(String tonalidade) {
        this.tonalidade = tonalidade;
    }

    public Integer getBpm() {
        return bpm;
    }

    public void setBpm(Integer bpm) {
        this.bpm = bpm;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getLinkCifra() {
        return linkCifra;
    }

    public void setLinkCifra(String linkCifra) {
        this.linkCifra = linkCifra;
    }

    public Ministerio getMinisterio() {
        return ministerio;
    }

    public void setMinisterio(Ministerio ministerio) {
        this.ministerio = ministerio;
    }
}
