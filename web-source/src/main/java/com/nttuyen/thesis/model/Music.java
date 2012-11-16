/**
 * 
 */
package com.nttuyen.thesis.model;

import com.nttuyen.dao.annotaion.Column;
import com.nttuyen.dao.annotaion.Id;
import com.nttuyen.dao.annotaion.Table;


/**
 * @author nttuyen
 *
 */
@Table(name="nttuyen_music")
public class Music {
	@Id(name="id")
	private long id;
	
	@Column(name="name")
	private String name;
	
	@Column(name="type")
	private String type;
	
	@Column(name="author")
	private String author;
	
	@Column(name="singer")
	private String singer;
	
	@Column(name="album")
	private String album;
	
	//Path to file media
	@Column(name="media")
	private String media;
	
	@Column(name="lyric")
	private String lyrics;
	
	@Column(name="downloaded")
	private int downloaded;
	
	@Column(name="modified")
	private long modified;
	
	//Cac thong tin bo xung!
	@Column(name="meta")
	private String meta;
	
	@Column(name="rate")
	private float rate;
	
	public Music() {
		this.setId(0);
		this.setName("");
		this.setType("");
		this.setAuthor("");
		this.setSinger("");
		this.setMedia("");
		this.setLyrics("");
		this.setAlbum("");
		this.setDownloaded(0);
		this.setModified(System.currentTimeMillis());
		this.setMeta("");
		this.setRate(0);
	}

	/**
	 * @param id the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}

	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param type the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param author the author to set
	 */
	public void setAuthor(String author) {
		this.author = author;
	}

	/**
	 * @return the author
	 */
	public String getAuthor() {
		return author;
	}

	/**
	 * @param singer the singer to set
	 */
	public void setSinger(String singer) {
		this.singer = singer;
	}

	/**
	 * @return the singer
	 */
	public String getSinger() {
		return singer;
	}

	/**
	 * @param media the media to set
	 */
	public void setMedia(String media) {
		this.media = media;
	}

	/**
	 * @return the media
	 */
	public String getMedia() {
		return media;
	}

	/**
	 * @param lyrics the lyrics to set
	 */
	public void setLyrics(String lyrics) {
		this.lyrics = lyrics;
	}

	/**
	 * @return the lyrics
	 */
	public String getLyrics() {
		return lyrics;
	}

	/**
	 * @param meta the meta to set
	 */
	public void setMeta(String meta) {
		this.meta = meta;
	}

	/**
	 * @return the meta
	 */
	public String getMeta() {
		return meta;
	}

	/**
	 * @param downloaded the downloaded to set
	 */
	public void setDownloaded(int downloaded) {
		this.downloaded = downloaded;
	}

	/**
	 * @return the downloaded
	 */
	public int getDownloaded() {
		return downloaded;
	}

	/**
	 * @param album the album to set
	 */
	public void setAlbum(String album) {
		this.album = album;
	}

	/**
	 * @return the album
	 */
	public String getAlbum() {
		return album;
	}

	/**
	 * @param rate the rate to set
	 */
	public void setRate(float rate) {
		this.rate = rate;
	}

	/**
	 * @return the rate
	 */
	public float getRate() {
		return rate;
	}

	/**
	 * @param modified the modified to set
	 */
	public void setModified(long modified) {
		this.modified = modified;
	}

	/**
	 * @return the modified
	 */
	public long getModified() {
		return modified;
	}
}
