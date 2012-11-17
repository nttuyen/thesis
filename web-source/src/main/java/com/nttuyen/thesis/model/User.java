/**
 * 
 */
package com.nttuyen.thesis.model;

import java.util.Date;

import com.nttuyen.persistence.annotaion.Column;
import com.nttuyen.persistence.annotaion.Id;
import com.nttuyen.persistence.annotaion.Table;

/**
 * @author nttuyen
 *
 */
@Table(name="nttuyen_user")
public class User {
	@Id(name="id")
	private long id;
	
	@Column(name="username")
	private String userName;
	
	@Column(name="password")
	private String password;
	
	private String password2;
	
	@Column(name="name")
	private String name;
	
	@Column(name="email")
	private String email;
	
	private String email2;
	
	@Column(name="address")
	private String address;
	
	@Column(name="birthday")
	private long birthday;
	
	@Column(name="mobile")
	private String mobile;
	
	@Column(name="favorite")
	private String favorite;
	
	@Column(name="register_time")
	private long registerTime;
	
	@Column(name="last_access")
	private long lastAccess;
	
	@Column(name="role")
	private long role;
	
	@Column(name="meta")
	private String meta;
	
	public User() {
		this.setId(0);
		this.setUserName("");
		this.setPassword("");
		this.setName("");
		this.setEmail("");
		this.setAddress("");
		this.setBirthday(new Date().getTime());
		this.setRegisterTime(new Date().getTime());
		this.setMobile("");
		this.setFavorite("");
		this.setMeta("");
		this.setLastAccess(System.currentTimeMillis());
		this.setRole(0);
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
	 * @param userName the userName to set
	 */
	public void setUserName(String userName) {
		this.userName = userName;
	}

	/**
	 * @return the userName
	 */
	public String getUserName() {
		return userName;
	}

	/**
	 * @param password the password to set
	 */
	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * @return the password
	 */
	public String getPassword() {
		return password;
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
	 * @param email the email to set
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * @return the email
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * @param mobile the mobile to set
	 */
	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	/**
	 * @return the mobile
	 */
	public String getMobile() {
		return mobile;
	}

	/**
	 * @param favorite the favorite to set
	 */
	public void setFavorite(String favorite) {
		this.favorite = favorite;
	}

	/**
	 * @return the favorite
	 */
	public String getFavorite() {
		return favorite;
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
	 * @param birthday the birthday to set
	 */
	public void setBirthday(long birthday) {
		this.birthday = birthday;
	}

	/**
	 * @return the birthday
	 */
	public long getBirthday() {
		return birthday;
	}

	/**
	 * @param address the address to set
	 */
	public void setAddress(String address) {
		this.address = address;
	}

	/**
	 * @return the address
	 */
	public String getAddress() {
		return address;
	}

	/**
	 * @param registerTime the registerTime to set
	 */
	public void setRegisterTime(long registerTime) {
		this.registerTime = registerTime;
	}

	/**
	 * @return the registerTime
	 */
	public long getRegisterTime() {
		return registerTime;
	}

	/**
	 * @param lastAccess the lastAccess to set
	 */
	public void setLastAccess(long lastAccess) {
		this.lastAccess = lastAccess;
	}

	/**
	 * @return the lastAccess
	 */
	public long getLastAccess() {
		return lastAccess;
	}

	/**
	 * @param role the role to set
	 */
	public void setRole(long role) {
		this.role = role;
	}

	/**
	 * @return the role
	 */
	public long getRole() {
		return role;
	}

	/**
	 * @param password2 the password2 to set
	 */
	public void setPassword2(String password2) {
		this.password2 = password2;
	}

	/**
	 * @return the password2
	 */
	public String getPassword2() {
		return password2;
	}

	/**
	 * @param email2 the email2 to set
	 */
	public void setEmail2(String email2) {
		this.email2 = email2;
	}

	/**
	 * @return the email2
	 */
	public String getEmail2() {
		return email2;
	}
}
