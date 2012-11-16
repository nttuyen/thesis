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
@Table(name="nttuyen_user_role")
public class UserRole {
	@Id(name="id")
	private long id;
	@Column(name="user")
	private long user;
	@Column(name="role")
	private long role;
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
	 * @param user the user to set
	 */
	public void setUser(long user) {
		this.user = user;
	}
	/**
	 * @return the user
	 */
	public long getUser() {
		return user;
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
}
