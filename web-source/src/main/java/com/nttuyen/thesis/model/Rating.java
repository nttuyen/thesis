/**
 * 
 */
package com.nttuyen.thesis.model;

import com.nttuyen.persistence.annotaion.Column;
import com.nttuyen.persistence.annotaion.Id;
import com.nttuyen.persistence.annotaion.Table;

/**
 * @author nttuyen
 *
 */
@Table(name="nttuyen_rating")
public class Rating {
	@Id(name="id")
	private long id;
	@Column(name="user_id")
	private long userId;
	@Column(name="music_id")
	private long musicId;
	@Column(name="rate")
	private byte rate;
	@Column(name="time")
	private long time;
	
	public Rating() {
		this.setId(0);
		this.setUserId(0);
		this.setMusicId(0);
		this.setRate((byte)0);
		this.setTime(System.currentTimeMillis());
	}
	
	public Rating(long userId, long musicID, byte rate) {
		this.id = 0;
		this.userId = userId;
		this.musicId = musicID;
		this.rate = rate;
		this.setTime(System.currentTimeMillis());
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

	/**
	 * @param time the time to set
	 */
	public void setTime(long time) {
		this.time = time;
	}

	/**
	 * @return the time
	 */
	public long getTime() {
		return time;
	}
}
