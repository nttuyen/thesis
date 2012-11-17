/**
 * 
 */
package com.nttuyen.thesis.model;

import com.nttuyen.persistence.annotaion.Column;
import com.nttuyen.persistence.annotaion.Id;
import com.nttuyen.persistence.annotaion.Table;

/**
 * @author Admin
 *
 */
@Table(name="nttuyen_rating_predict")
public class Predict {
	@Id(name="id")
	private long id;
	@Column(name="user_id")
	private long userId;
	@Column(name="music_id")
	private long musicId;
	@Column(name="rate")
	private byte rate;
	
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
	 * @param userId the userId to set
	 */
	public void setUserId(long userId) {
		this.userId = userId;
	}
	/**
	 * @return the userId
	 */
	public long getUserId() {
		return userId;
	}
	/**
	 * @param musicId the musicId to set
	 */
	public void setMusicId(long musicId) {
		this.musicId = musicId;
	}
	/**
	 * @return the musicId
	 */
	public long getMusicId() {
		return musicId;
	}
	/**
	 * @param rate the rate to set
	 */
	public void setRate(byte rate) {
		this.rate = rate;
	}
	/**
	 * @return the rate
	 */
	public byte getRate() {
		return rate;
	}
	
}
