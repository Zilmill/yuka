(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.YUKA = global.YUKA || {})));
}(this, (function (exports) { 'use strict';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Telegram {

	constructor ( senderId, receiverId, message, data, delay ) {

		this.senderId = senderId;
		this.receiverId = receiverId;
		this.message = message;
		this.data = data;
		this.delay = delay;

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class MessageDispatcher {

	constructor ( entityManager ) {

		this.delayedTelegrams = new Array();
		this.entityManager = entityManager;

	}

	deliver ( receiver, telegram ) {

		if ( receiver.handleMessage( telegram ) === false ) {

			console.warn( 'YUKA.MessageDispatcher: Message not handled by receiver: %o', receiver );

		}

	}

	// send a message to another agent

	dispatch ( sender, receiver, message, delay, data ) {

		const telegram = new Telegram( sender.id, receiver.id, message, data, 0 );

		if ( delay <= 0 ) {

			this.deliver( receiver, telegram );

		} else {

			telegram.delay = delay;

			this.delayedTelegrams.push( telegram );

		}

	}

	// process delayed messages

	dispatchDelayedMessages ( delta ) {

		let i = this.delayedTelegrams.length;

		while ( i -- ) {

			const telegram = this.delayedTelegrams[ i ];

			telegram.delay -= delta;

			if ( telegram.delay <= 0 ) {

				const receiver = this.entityManager.getEntityById( telegram.receiverId );

				this.deliver( receiver, telegram );

				this.delayedTelegrams.pop();

			}

		}

	}


}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class EntityManager {

	constructor () {

		this.entities = new Map();
		this.messageDispatcher = new MessageDispatcher( this );

	}

	add ( entity ) {

		this.entities.set( entity.id, entity );

		entity.addEventListener( 'message', this.onMessage, this );

		return this;

	}

	remove ( entity ) {

		this.entities.delete( entity.id );

		entity.removeEventListener( 'message', this.onMessage );

		return this;

	}

	getEntityById ( id ) {

		return this.entities.get( id );

	}

	update ( delta ) {

		for ( let entity of this.entities.values() ) {

			entity.update( delta );

			entity.updateMatrix();

		}

		this.messageDispatcher.dispatchDelayedMessages( delta );

	}

	onMessage ( event ) {

		const sender = event.target;
		const receiver = event.receiver;
		const message = event.message;
		const delay = event.delay;
		const data = event.data;

		this.messageDispatcher.dispatch( sender, receiver, message, delay, data );

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class EventDispatcher {

	constructor () {

		this.listeners = {};

	}

	addEventListener ( type, listener, scope ) {

		const listeners = this.listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listener.scope = scope;

			listeners[ type ].push( listener );

		}

	}

	hasEventListener ( type, listener ) {

		const listeners = this.listeners;

		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	}

	removeEventListener ( type, listener ) {

		const listeners = this.listeners;
		const listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	dispatchEvent ( event ) {

		const listeners = this.listeners;
		const listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i ++ ) {

				const listener = array[ i ];

				listener.call( listener.scope || this, event );

			}

		}

	}

}

const _Math = {

	clamp: ( value, min, max ) => {

		return Math.max( min, Math.min( max, value ) );

	},

	randFloat: ( min, max ) => {

		return min + Math.random() * ( max - min );

	}

};

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

 class Vector3 {

	constructor ( x = 0, y = 0, z = 0 ) {

		this.x = x;
		this.y = y;
		this.z = z;

	}

	set ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	copy ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	add ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	addScalar ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	addVectors ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	sub ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar ( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	subVectors ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	multiply ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	multiplyScalar ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;

	}

	multiplyVectors ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	divide ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar ( s ) {

		this.x /= s;
		this.y /= s;
		this.z /= s;

		return this;

	}

	divideVectors ( a, b ) {

		this.x = a.x / b.x;
		this.y = a.y / b.y;
		this.z = a.z / b.z;

		return this;

	}

	dot ( v ) {

		return ( this.x * v.x ) + ( this.y * v.y ) + ( this.z * v.z );

	}

	cross ( v ) {

		const x = this.x, y = this.y, z = this.z;

		this.x = ( y * v.z ) - ( z * v.y );
		this.y = ( z * v.x ) - ( x * v.z );
		this.z = ( x * v.y ) - ( y * v.x );

		return this;

	}

	crossVectors ( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ( ay * bz ) - ( az * by );
		this.y = ( az * bx ) - ( ax * bz );
		this.z = ( ax * by ) - ( ay * bx );

		return this;

	}

	angleTo ( v ) {

		var theta = this.dot( v ) / ( Math.sqrt( this.lengthSq() * v.lengthSq() ) );

		// clamp, to handle numerical problems

		return Math.acos( _Math.clamp( theta, - 1, 1 ) );

	}

	length () {

		return Math.sqrt( this.lengthSquared() );

	}

	lengthSquared () {

		return this.dot( this );

	}

	distanceTo ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared ( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return ( dx * dx ) + ( dy * dy ) + ( dz * dz );

	}

	normalize () {

		return this.divideScalar( this.length() || 1 );

	}

	applyMatrix4 ( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( ( e[ 3 ] * x ) + ( e[ 7 ] * y ) + ( e[ 11 ] * z ) + e[ 15 ] );

		this.x = ( ( e[ 0 ] * x ) + ( e[ 4 ] * y ) + ( e[ 8 ]  * z ) + e[ 12 ] ) * w;
		this.y = ( ( e[ 1 ] * x ) + ( e[ 5 ] * y ) + ( e[ 9 ]  * z ) + e[ 13 ] ) * w;
		this.z = ( ( e[ 2 ] * x ) + ( e[ 6 ] * y ) + ( e[ 10 ] * z ) + e[ 14 ] ) * w;

		return this;

	}

	applyQuaternion ( q ) {

		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix =  qw * x + qy * z - qz * y;
		const iy =  qw * y + qz * x - qx * z;
		const iz =  qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	setFromMatrixColumn ( m, i ) {

		return this.fromArray( m.elements, i * 4 );

	}

	equals ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	fromArray ( array, offset = 0 ) {

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	toArray ( array = [], offset = 0 ) {

		array[ offset + 0 ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Quaternion {

	constructor ( x = 0, y = 0, z = 0, w = 1 ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

	}

	set ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	}

	copy ( q ) {

		this.x = q.x;
		this.y = q.y;
		this.z = q.z;
		this.w = q.w;

		return this;

	}

	inverse () {

		return this.conjugate().normalize();

	}

	conjugate () {

		this.x *= - 1;
		this.y *= - 1;
		this.z *= - 1;

		return this;

	}

	dot ( q ) {

		return ( this.x * q.x ) + ( this.y * q.y ) + ( this.z * q.z ) + ( this.w * q.w );

	}

	length () {

		return Math.sqrt( this.lengthSquared() );

	}

	lengthSquared () {

		return this.dot( this );

	}

	normalize () {

		let l = this.length();

		if ( l === 0 ) {

			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 1;

		} else {

			l = 1 / l;

			this.x = this.x * l;
			this.y = this.y * l;
			this.z = this.z * l;
			this.w = this.w * l;

		}

		return this;

	}

	multiply ( q ) {

		return this.multiplyQuaternions( this, q );

	}

	premultiply ( q ) {

		return this.multiplyQuaternions( q, this );

	}

	multiplyQuaternions ( a, b ) {

		const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
		const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

		this.x = ( qax * qbw ) + ( qaw * qbx ) + ( qay * qbz ) - ( qaz * qby );
		this.y = ( qay * qbw ) + ( qaw * qby ) + ( qaz * qbx ) - ( qax * qbz );
		this.z = ( qaz * qbw ) + ( qaw * qbz ) + ( qax * qby ) - ( qay * qbx );
		this.w = ( qaw * qbw ) - ( qax * qbx ) - ( qay * qby ) - ( qaz * qbz );

		return this;

	}

	slerp ( q, t ) {

		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( q );

		const x = this.x, y = this.y, z = this.z, w = this.w;

		let cosHalfTheta = w * q.w + x * q.x + y * q.y + z * q.z;

		if ( cosHalfTheta < 0 ) {

			this.w = - q.w;
			this.x = - q.x;
			this.y = - q.y;
			this.z = - q.z;

			cosHalfTheta = - cosHalfTheta;

		} else {

			this.copy( q );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this.w = w;
			this.x = x;
			this.y = y;
			this.z = z;

			return this;

		}

		const sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

		if ( Math.abs( sinHalfTheta ) < 0.001 ) {

			this.w = 0.5 * ( w + this.w );
			this.x = 0.5 * ( x + this.x );
			this.y = 0.5 * ( y + this.y );
			this.z = 0.5 * ( z + this.z );

			return this;

		}

		const halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta );
		const ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta;
		const ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this.w = ( w * ratioA ) + ( this.w * ratioB );
		this.x = ( x * ratioA ) + ( this.x * ratioB );
		this.y = ( y * ratioA ) + ( this.y * ratioB );
		this.z = ( z * ratioA ) + ( this.z * ratioB );

		return this;

	}

	setFromRotationMatrix ( m ) {

		const e = m.elements;

		const m11 = e[ 0 ], m12 = e[ 4 ], m13 = e[ 8 ];
		const m21 = e[ 1 ], m22 = e[ 5 ], m23 = e[ 9 ];
		const m31 = e[ 2 ], m32 = e[ 6 ], m33 = e[ 10 ];

		const trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			let s = 0.5 / Math.sqrt( trace + 1.0 );

			this.w = 0.25 / s;
			this.x = ( m32 - m23 ) * s;
			this.y = ( m13 - m31 ) * s;
			this.z = ( m21 - m12 ) * s;

		} else if ( ( m11 > m22 ) && ( m11 > m33 ) ) {

			let s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this.w = ( m32 - m23 ) / s;
			this.x = 0.25 * s;
			this.y = ( m12 + m21 ) / s;
			this.z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			let s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this.w = ( m13 - m31 ) / s;
			this.x = ( m12 + m21 ) / s;
			this.y = 0.25 * s;
			this.z = ( m23 + m32 ) / s;

		} else {

			let s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this.w = ( m21 - m12 ) / s;
			this.x = ( m13 + m31 ) / s;
			this.y = ( m23 + m32 ) / s;
			this.z = 0.25 * s;

		}

		return this;

	}

	equals ( q ) {

		return ( ( q.x === this.x ) && ( q.y === this.y ) && ( q.z === this.z ) && ( q.w === this.w ) );

	}

	fromArray ( array, offset = 0 ) {

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];
		this.w = array[ offset + 3 ];

		return this;

	}

	toArray ( array = [], offset = 0 ) {

		array[ offset + 0 ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;
		array[ offset + 3 ] = this.w;

		return array;

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

 class Matrix4 {

 	constructor () {

		this.elements = [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		];

 	}

	set ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		const e = this.elements;

		e[ 0 ] = n11; e[ 4 ] = n12; e[ 8 ] = n13; e[ 12 ] = n14;
		e[ 1 ] = n21; e[ 5 ] = n22; e[ 9 ] = n23; e[ 13 ] = n24;
		e[ 2 ] = n31; e[ 6 ] = n32; e[ 10 ] = n33; e[ 14 ] = n34;
		e[ 3 ] = n41; e[ 7 ] = n42; e[ 11 ] = n43; e[ 15 ] = n44;

		return this;

	}

	identity () {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	extractBasis ( xAxis, yAxis, zAxis ) {

		xAxis.setFromMatrixColumn( this, 0 );
		yAxis.setFromMatrixColumn( this, 1 );
		zAxis.setFromMatrixColumn( this, 2 );

		return this;

	}

	makeBasis ( xAxis, yAxis, zAxis ) {

		this.set(
			xAxis.x, yAxis.x, zAxis.x, 0,
			xAxis.y, yAxis.y, zAxis.y, 0,
			xAxis.z, yAxis.z, zAxis.z, 0,
			0,       0,       0,       1
		);

		return this;

	}

	multiply ( m ) {

		return this.multiplyMatrices( this, m );

	}

	premultiply ( m ) {

		return this.multiplyMatrices( m, this );

	}

	multiplyMatrices ( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const e = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		e[ 0 ]  = ( a11 * b11 ) + ( a12 * b21 ) + ( a13 * b31 ) + ( a14 * b41 );
		e[ 4 ]  = ( a11 * b12 ) + ( a12 * b22 ) + ( a13 * b32 ) + ( a14 * b42 );
		e[ 8 ]  = ( a11 * b13 ) + ( a12 * b23 ) + ( a13 * b33 ) + ( a14 * b43 );
		e[ 12 ] = ( a11 * b14 ) + ( a12 * b24 ) + ( a13 * b34 ) + ( a14 * b44 );

		e[ 1 ]  = ( a21 * b11 ) + ( a22 * b21 ) + ( a23 * b31 ) + ( a24 * b41 );
		e[ 5 ]  = ( a21 * b12 ) + ( a22 * b22 ) + ( a23 * b32 ) + ( a24 * b42 );
		e[ 9 ]  = ( a21 * b13 ) + ( a22 * b23 ) + ( a23 * b33 ) + ( a24 * b43 );
		e[ 13 ] = ( a21 * b14 ) + ( a22 * b24 ) + ( a23 * b34 ) + ( a24 * b44 );

		e[ 2 ]  = ( a31 * b11 ) + ( a32 * b21 ) + ( a33 * b31 ) + ( a34 * b41 );
		e[ 6 ]  = ( a31 * b12 ) + ( a32 * b22 ) + ( a33 * b32 ) + ( a34 * b42 );
		e[ 10 ] = ( a31 * b13 ) + ( a32 * b23 ) + ( a33 * b33 ) + ( a34 * b43 );
		e[ 14 ] = ( a31 * b14 ) + ( a32 * b24 ) + ( a33 * b34 ) + ( a34 * b44 );

		e[ 3 ]  = ( a41 * b11 ) + ( a42 * b21 ) + ( a43 * b31 ) + ( a44 * b41 );
		e[ 7 ]  = ( a41 * b12 ) + ( a42 * b22 ) + ( a43 * b32 ) + ( a44 * b42 );
		e[ 11 ] = ( a41 * b13 ) + ( a42 * b23 ) + ( a43 * b33 ) + ( a44 * b43 );
		e[ 15 ] = ( a41 * b14 ) + ( a42 * b24 ) + ( a43 * b34 ) + ( a44 * b44 );

		return this;

	}

	multiplyScalar ( s ) {

		const e = this.elements;

		e[ 0 ] *= s; e[ 4 ] *= s; e[ 8 ] *= s; e[ 12 ] *= s;
		e[ 1 ] *= s; e[ 5 ] *= s; e[ 9 ] *= s; e[ 13 ] *= s;
		e[ 2 ] *= s; e[ 6 ] *= s; e[ 10 ] *= s; e[ 14 ] *= s;
		e[ 3 ] *= s; e[ 7 ] *= s; e[ 11 ] *= s; e[ 15 ] *= s;

		return this;

	}

	compose ( position, quaternion, scale ) {

		this.makeRotationFromQuaternion( quaternion );
		this.scale( scale );
		this.setPosition( position );

		return this;

	}

	makeRotationFromQuaternion ( q ) {

		const e = this.elements;

		const x = q.x, y = q.y, z = q.z, w = q.w;
		const x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		e[ 0 ] = 1 - ( yy + zz );
		e[ 4 ] = xy - wz;
		e[ 8 ] = xz + wy;

		e[ 1 ] = xy + wz;
		e[ 5 ] = 1 - ( xx + zz );
		e[ 9 ] = yz - wx;

		e[ 2 ] = xz - wy;
		e[ 6 ] = yz + wx;
		e[ 10 ] = 1 - ( xx + yy );

		e[ 3 ] = 0;
		e[ 7 ] = 0;
		e[ 11 ] = 0;

		e[ 12 ] = 0;
		e[ 13 ] = 0;
		e[ 14 ] = 0;
		e[ 15 ] = 1;

		return this;

	}

	scale ( v ) {

		const e = this.elements;

		const x = v.x, y = v.y, z = v.z;

		e[ 0 ] *= x; e[ 4 ] *= y; e[ 8 ] *= z;
		e[ 1 ] *= x; e[ 5 ] *= y; e[ 9 ] *= z;
		e[ 2 ] *= x; e[ 6 ] *= y; e[ 10 ] *= z;
		e[ 3 ] *= x; e[ 7 ] *= y; e[ 11 ] *= z;

		return this;

	}

	setPosition ( v ) {

		const e = this.elements;

		e[ 12 ] = v.x;
		e[ 13 ] = v.y;
		e[ 14 ] = v.z;

		return this;

	}

	transpose () {

		const e = this.elements;
		let t;

		t = e[ 1 ]; e[ 1 ] = e[ 4 ]; e[ 4 ] = t;
		t = e[ 2 ]; e[ 2 ] = e[ 8 ]; e[ 8 ] = t;
		t = e[ 6 ]; e[ 6 ] = e[ 9 ]; e[ 9 ] = t;

		t = e[ 3 ]; e[ 3 ] = e[ 12 ]; e[ 12 ] = t;
		t = e[ 7 ]; e[ 7 ] = e[ 13 ]; e[ 13 ] = t;
		t = e[ 11 ]; e[ 11 ] = e[ 14 ]; e[ 14 ] = t;

		return this;


	}

	equals ( m ) {

		const e = this.elements;
		const me = m.elements;

		for ( let i = 0; i < 16; i ++ ) {

			if ( e[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

	fromArray ( array, offset = 0 ) {

		const e = this.elements;

		for ( let i = 0; i < 16; i ++ ) {

			e[ i ] = array[ i + offset ];

		}

		return this;

	}

	toArray ( array = [], offset = 0 ) {

		const e = this.elements;

		array[ offset + 0 ] = e[ 0 ];
		array[ offset + 1 ] = e[ 1 ];
		array[ offset + 2 ] = e[ 2 ];
		array[ offset + 3 ] = e[ 3 ];

		array[ offset + 4 ] = e[ 4 ];
		array[ offset + 5 ] = e[ 5 ];
		array[ offset + 6 ] = e[ 6 ];
		array[ offset + 7 ] = e[ 7 ];

		array[ offset + 8 ] = e[ 8 ];
		array[ offset + 9 ] = e[ 9 ];
		array[ offset + 10 ] = e[ 10 ];
		array[ offset + 11 ] = e[ 11 ];

		array[ offset + 12 ] = e[ 12 ];
		array[ offset + 13 ] = e[ 13 ];
		array[ offset + 14 ] = e[ 14 ];
		array[ offset + 15 ] = e[ 15 ];

		return array;

	}

 }


Object.assign( Matrix4.prototype, {

	lookAt: function () {

		const x = new Vector3();
		const y = new Vector3();
		const z = new Vector3();

		return function lookAt ( eye, target, up ) {

			z.subVectors( eye, target );

 			if ( z.lengthSquared() === 0 ) {

 				// eye and target are in the same position

 				z.z = 1;

 			}

 			z.normalize();
 			x.crossVectors( up, z );

 			if ( x.lengthSquared() === 0 ) {

 				// up and z are parallel

 				if ( Math.abs( up.z ) === 1 ) {

 					z.x += 0.0001;

 				} else {

 					z.z += 0.0001;

 				}

 				z.normalize();
 				x.crossVectors( up, z );

 			}

 			x.normalize();
 			y.crossVectors( z, x );

			const e = this.elements;

 			e[ 0 ] = x.x; e[ 4 ] = y.x; e[ 8 ] = z.x;
 			e[ 1 ] = x.y; e[ 5 ] = y.y; e[ 9 ] = z.y;
 			e[ 2 ] = x.z; e[ 6 ] = y.z; e[ 10 ] = z.z;

 			return this;

		 };


	 } ()

 } );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class GameEntity extends EventDispatcher {

	constructor () {

		super();

		this.id = GameEntity.__nextId ++;
		this.name = '';

		this.position = new Vector3();
		this.rotation = new Quaternion();
		this.scale = new Vector3( 1, 1, 1 );

		this.up = new Vector3( 0, 1, 0 );

		this.matrix = new Matrix4();

	}

	update () {

		console.warn( 'YUKA.GameEntity: .update() must be implemented in derived class.' );

	}

	sendMessage ( receiver, message, delay = 0, data = null ) {

		const event = {
			type: 'message',
			receiver: receiver,
			message: message,
			delay: delay,
			data: data
		};

		this.dispatchEvent( event );

	}

	handleMessage () {

		return false;

	}

	updateMatrix () {

		this.matrix.compose( this.position, this.rotation, this.scale );

	}

}

GameEntity.__nextId = 0;

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class MovingEntity extends GameEntity {

	constructor () {

		super();

		this.velocity = new Vector3();
		this.mass = 1;
		this.maxSpeed = 1; // the maximum speed at which this entity may travel
		this.maxForce = 100; // the maximum force this entity can produce to power itself (think rockets and thrust)
		this.maxTurnRate = Math.PI; // the maximum rate (radians per second) at which this vehicle can rotate

	}

	getDirection ( result = new Vector3() ) {

		return result.set( 0, 0, 1 ).applyQuaternion( this.rotation ).normalize();

	}

	getSpeed () {

		return this.velocity.length();

	}

	getSpeedSquared () {

		return this.velocity.lengthSquared();

	}

}

Object.assign( MovingEntity.prototype, {

	// given a target position, this method rotates the entity by an amount not
	// greater than maxTurnRate until it directly faces the target

	rotateToTarget: function () {

		const direction = new Vector3();
		const rotationMatrix = new Matrix4();
		const targetRotation = new Quaternion();

		return function rotateToTarget ( target ) {

			this.getDirection( direction );

			// first determine the angle between the look vector and the target

			const angle = target.angleTo( direction );

			// return true if the player is facing the target

			if ( angle < 0.00001 ) return true;

			// clamp the amount to turn to the max turn rate

			const t = ( angle > this.maxTurnRate ) ? ( this.maxTurnRate / angle ) : 1;

			// get target rotation

			rotationMatrix.lookAt( target, this.position, this.up );
			targetRotation.setFromRotationMatrix( rotationMatrix );

			// interpolate

			this.rotation.slerp( targetRotation, t );

			// adjust velocity

			this.velocity.applyQuaternion( this.rotation );

			return false;

		};

	} (),

	lookAt: function () {

		const rotationMatrix = new Matrix4();

		return function lookAt ( target ) {

			rotationMatrix.lookAt( target, this.position, this.up );
			this.rotation.setFromRotationMatrix( rotationMatrix );

			return this;

		};

	} ()

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Path {

	constructor () {

		this.loop = false;
		this._waypoints = [];
		this._index = 0;

	}

	add ( waypoint ) {

		this._waypoints.push( waypoint );

		return this;

	}

	clear () {

		this._waypoints.length = 0;

		return this;

	}

	finished () {

		const lastIndex =  this._waypoints.length - 1;

		return ( this.loop === true ) ? false : ( this._index === lastIndex );

	}

	advance () {

		this._index ++;

		if ( ( this._index === this._waypoints.length ) ) {

			if (  this.loop === true ) {

				this._index = 0;

			} else {

				this._index --;

			}

		}

		return this;

	}

	current () {

		return this._waypoints[ this._index ];

	}

}

const _Math$1 = {

	clamp: ( value, min, max ) => {

		return Math.max( min, Math.min( max, value ) );

	},

	randFloat: ( min, max ) => {

		return min + Math.random() * ( max - min );

	}

};

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

 class Vector3$1 {

	constructor ( x = 0, y = 0, z = 0 ) {

		this.x = x;
		this.y = y;
		this.z = z;

	}

	set ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	copy ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	add ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	addScalar ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	addVectors ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	sub ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar ( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	subVectors ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	multiply ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	multiplyScalar ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;

		return this;

	}

	multiplyVectors ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	divide ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar ( s ) {

		this.x /= s;
		this.y /= s;
		this.z /= s;

		return this;

	}

	divideVectors ( a, b ) {

		this.x = a.x / b.x;
		this.y = a.y / b.y;
		this.z = a.z / b.z;

		return this;

	}

	dot ( v ) {

		return ( this.x * v.x ) + ( this.y * v.y ) + ( this.z * v.z );

	}

	cross ( v ) {

		const x = this.x, y = this.y, z = this.z;

		this.x = ( y * v.z ) - ( z * v.y );
		this.y = ( z * v.x ) - ( x * v.z );
		this.z = ( x * v.y ) - ( y * v.x );

		return this;

	}

	crossVectors ( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ( ay * bz ) - ( az * by );
		this.y = ( az * bx ) - ( ax * bz );
		this.z = ( ax * by ) - ( ay * bx );

		return this;

	}

	angleTo ( v ) {

		var theta = this.dot( v ) / ( Math.sqrt( this.lengthSq() * v.lengthSq() ) );

		// clamp, to handle numerical problems

		return Math.acos( _Math$1.clamp( theta, - 1, 1 ) );

	}

	length () {

		return Math.sqrt( this.lengthSquared() );

	}

	lengthSquared () {

		return this.dot( this );

	}

	distanceTo ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared ( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return ( dx * dx ) + ( dy * dy ) + ( dz * dz );

	}

	normalize () {

		return this.divideScalar( this.length() || 1 );

	}

	applyMatrix4 ( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( ( e[ 3 ] * x ) + ( e[ 7 ] * y ) + ( e[ 11 ] * z ) + e[ 15 ] );

		this.x = ( ( e[ 0 ] * x ) + ( e[ 4 ] * y ) + ( e[ 8 ]  * z ) + e[ 12 ] ) * w;
		this.y = ( ( e[ 1 ] * x ) + ( e[ 5 ] * y ) + ( e[ 9 ]  * z ) + e[ 13 ] ) * w;
		this.z = ( ( e[ 2 ] * x ) + ( e[ 6 ] * y ) + ( e[ 10 ] * z ) + e[ 14 ] ) * w;

		return this;

	}

	applyQuaternion ( q ) {

		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix =  qw * x + qy * z - qz * y;
		const iy =  qw * y + qz * x - qx * z;
		const iz =  qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	setFromMatrixColumn ( m, i ) {

		return this.fromArray( m.elements, i * 4 );

	}

	equals ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	fromArray ( array, offset = 0 ) {

		this.x = array[ offset + 0 ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	toArray ( array = [], offset = 0 ) {

		array[ offset + 0 ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class SteeringManager {

	constructor ( vehicle ) {

		this.vehicle = vehicle;
		this.behaviors = [];

		this._steeringForce = new Vector3$1(); // the calculated steering force per simulation step

	}

	add ( behavior ) {

		this.behaviors.push( behavior );

		return this;

	}

	remove ( behavior ) {

		const index = this.behaviors.indexOf( behavior );

		this.behaviors.splice( index, 1 );

		return this;

	}

	_calculate ( delta, optionalTarget )  {

		const result = optionalTarget || new Vector3$1();

		this._calculateByOrder( delta );

		return result.copy( this._steeringForce );

	}

	// this method calculates how much of its max steering force the vehicle has
	// left to apply and then applies that amount of the force to add

	_accumulate ( forceToAdd ) {

		// calculate how much steering force the vehicle has used so far

		const magnitudeSoFar = this._steeringForce.length();

		// calculate how much steering force remains to be used by this vehicle

		const magnitudeRemaining = this.vehicle.maxForce - magnitudeSoFar;

		// return false if there is no more force left to use

		if ( magnitudeRemaining <= 0 ) return false;

		// calculate the magnitude of the force we want to add

		const magnitudeToAdd = forceToAdd.length();

		// restrict the magnitude of forceToAdd, so we don't exceed the max force of the vehicle

		if ( magnitudeToAdd > magnitudeRemaining ) {

			forceToAdd.normalize().multiplyScalar( magnitudeRemaining );

		}

		// add force

		this._steeringForce.add( forceToAdd );

		return true;

	}

}

Object.assign( SteeringManager.prototype, {

	_calculateByOrder: function () {

		const force = new Vector3$1();

		return function _calculatePrioritized ( delta ) {

			// reset steering force

			this._steeringForce.set( 0, 0, 0 );

			// calculate for each behavior the respective force

			for ( let behavior of this.behaviors ) {

				force.set( 0, 0 , 0 );

				behavior.calculate( this.vehicle, force, delta );

				force.multiplyScalar( behavior.weigth );

				if ( this._accumulate( force ) === false ) return;

			}

		};

	} ()

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Vehicle extends MovingEntity {

	constructor () {

		super();

		this.steering = new SteeringManager( this );
		this.smoothing = false;

	}

}

Object.assign( Vehicle.prototype, {

	update: function() {

		const steeringForce = new Vector3();
		const displacement = new Vector3();
		const acceleration = new Vector3();
		const target = new Vector3();

		return function update ( delta ) {

			// calculate steering force

			this.steering._calculate( delta, steeringForce );

			// acceleration = force / mass

			acceleration.copy( steeringForce ).divideScalar( this.mass );

			// update velocity

			this.velocity.add( acceleration.multiplyScalar( delta ) );

			// make sure vehicle does not exceed maximum speed

			if ( this.getSpeedSquared() > ( this.maxSpeed * this.maxSpeed ) ) {

				this.velocity.normalize();
				this.velocity.multiplyScalar( this.maxSpeed );

			}

			// calculate displacement

			displacement.copy( this.velocity ).multiplyScalar( delta );

			// calculate target position

			target.copy( this.position ).add( displacement );

			// update the orientation if the vehicle has non zero speed

			if ( this.getSpeedSquared() > 0.00000001 ) {

				// check smoothing

				if ( this.smoothing === true ) {

					// TODO

				} else {

					this.lookAt( target );

				}

			}

			// update position

			this.position.copy( target );

		};

	} (),

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class SteeringBehavior {

	constructor () {

		// use this value to tweak the amount that a steering force
		// contributes to the total steering force

		this.weigth = 1;

	}

	calculate () {}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class ArriveBehavior extends SteeringBehavior {

	constructor ( target, deceleration = 3 ) {

		super();

		this.target = target;
		this.deceleration = deceleration;

	}

}

Object.assign( ArriveBehavior.prototype, {

	calculate: function () {

		const desiredVelocity = new Vector3$1();
		const displacement = new Vector3$1();

		return function calculate ( vehicle, force, delta ) {

			const target = this.target;
			const deceleration = this.deceleration;

			displacement.subVectors( target, vehicle.position );

			const distance = displacement.length();

			if ( distance > 0 ) {

				// calculate the speed required to reach the target given the desired deceleration

				let speed = distance / deceleration;

				// make sure the speed does not exceed the max

				speed = Math.min( speed, vehicle.maxSpeed );

				// from here proceed just like "seek" except we don't need to normalize
				// the "displacement" vector because we have already gone to the trouble
				// of calculating its length.

				desiredVelocity.copy( displacement ).multiplyScalar( speed / distance );

				force.subVectors( desiredVelocity, vehicle.velocity );

			}

		};

	} ()

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class FleeBehavior extends SteeringBehavior {

	constructor ( target, panicDistance = 10 ) {

		super();

		this.target = target;
		this.panicDistance = panicDistance;

	}

}

Object.assign( FleeBehavior.prototype, {

	calculate: function () {

		const desiredVelocity = new Vector3$1();

		return function calculate ( vehicle, force, delta ) {

			const target = this.target;

			// only flee if the target is within panic distance

			const distanceToTargetSq = vehicle.position.distanceToSquared( target );

			if ( distanceToTargetSq < ( this.panicDistance * this.panicDistance ) ) {

				// from here, the only difference compared to seek is that the desired
				// velocity is calculated using a vector pointing in the opposite direction

				desiredVelocity.subVectors( vehicle.position, target ).normalize();

				// if target and vehicle position are identical, choose default velocity

				if ( desiredVelocity.lengthSquared() === 0 ) {

					desiredVelocity.set( 0, 0, 1 );

				}

				desiredVelocity.multiplyScalar( vehicle.maxSpeed );

				force.subVectors( desiredVelocity, vehicle.velocity );

			}

		};

	} ()

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class EvadeBehavior extends SteeringBehavior {

	constructor ( target , pursuer ) {

		super();

		this.target = target;
		this.pursuer = pursuer;

		// internal behaviors

		this._flee = new FleeBehavior();

	}

}

Object.assign( EvadeBehavior.prototype, {

	calculate: function () {

		const displacement = new Vector3$1();
		const newPuruserVelocity = new Vector3$1();
		const predcitedPosition = new Vector3$1();

		return function calculate ( vehicle, force, delta ) {

			const pursuer = this.pursuer;

			displacement.subVectors( pursuer.position, vehicle.position );

			const lookAheadTime = displacement.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );

			// calculate new velocity and predicted future position

			newPuruserVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
			predcitedPosition.addVectors( pursuer.position, newPuruserVelocity );

			// now flee away from predicted future position of the pursuer

			this._flee.target = predcitedPosition;
			this._flee.calculate( vehicle, force );

		};

	} ()

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class SeekBehavior extends SteeringBehavior {

	constructor ( target ) {

		super();

		this.target = target;

	}

}

Object.assign( SeekBehavior.prototype, {

	calculate: function () {

		const desiredVelocity = new Vector3$1();

		return function calculate ( vehicle, force, delta ) {

			const target = this.target;

			// First the desired velocity is calculated.
			// This is the velocity the agent would need to reach the target position in an ideal world.
			// It represents the vector from the agent to the target,
			// scaled to be the length of the maximum possible speed of the agent.

			desiredVelocity.subVectors( target, vehicle.position ).normalize();
			desiredVelocity.multiplyScalar( vehicle.maxSpeed );

			// The steering force returned by this method is the force required,
			// which when added to the agent’s current velocity vector gives the desired velocity.
			// To achieve this you simply subtract the agent’s current velocity from the desired velocity.

			force.subVectors( desiredVelocity, vehicle.velocity );

		};

	} ()

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class FollowPathBehavior extends SteeringBehavior {

	constructor ( path ) {

		super();

		this.path = path; // list of waypoints to follow
		this._nextWaypointDistance = 1; // the distance a waypoint is set to the new target

		// internal behaviors

		this._seek = new SeekBehavior();
		this._arrive = new ArriveBehavior();

	}

	calculate ( vehicle, force, delta ) {

		const path = this.path;
		const nextWaypointDistance = this._nextWaypointDistance;

		// calculate distance in square space from current waypoint to vehicle

		var distanceSq = path.current().distanceToSquared( vehicle.position );

		// move to next waypoint if close enough to current target

		if ( distanceSq < ( nextWaypointDistance * nextWaypointDistance ) ) {

			path.advance();

		}

		const target = path.current();

		if ( path.finished() === true ) {

			this._arrive.target = target;
			this._arrive.calculate( vehicle, force );

		} else {

			this._seek.target = target;
			this._seek.calculate( vehicle, force );

		}

	}

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class PursuitBehavior extends SteeringBehavior {

	constructor ( target, evader ) {

		super();

		this.target = target;
		this.evader = evader;

		// internal behaviors

		this._seek = new SeekBehavior();

	}

}

Object.assign( PursuitBehavior.prototype, {

	calculate: function () {

		const displacement = new Vector3$1();
		const vehicleDirection = new Vector3$1();
		const evaderDirection = new Vector3$1();
		const newEvaderVelocity = new Vector3$1();
		const predcitedPosition = new Vector3$1();

		return function calculate ( vehicle, force, delta ) {

			const evader = this.evader;

			displacement.subVectors( evader.position, vehicle.position );

			// 1. if the evader is ahead and facing the agent then we can just seek for the evader's current position

			vehicle.getDirection( vehicleDirection );
			evader.getDirection( evaderDirection );

			// first condition: evader must be in front of the pursuer

			const evaderAhead = displacement.dot( vehicleDirection ) > 0;

			// second condition: evader must almost directly facing the agent

			const facing = vehicleDirection.dot( evaderDirection ) < - 0.95;

			if ( evaderAhead === true && facing === true ) {

				this._seek( force, evader.position );
				return;

			}

			// 2. evader not considered ahead so we predict where the evader will be

			// the lookahead time is proportional to the distance between the evader
			// and the pursuer. and is inversely proportional to the sum of the
			// agent's velocities

			const lookAheadTime = displacement.length() / ( vehicle.maxSpeed + evader.getSpeed() );

			// calculate new velocity and predicted future position

			newEvaderVelocity.copy( evader.velocity ).multiplyScalar( lookAheadTime );
			predcitedPosition.addVectors( evader.position, newEvaderVelocity );

			// now seek to the predicted future position of the evader

			this._seek.target = predcitedPosition;
			this._seek.calculate( force );

		};

	} ()

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class WanderBehavior extends SteeringBehavior {

	constructor ( radius = 2, distance = 10, jitter = 20 ) {

		super();

		this.radius = radius; // the radius of the constraining circle for the wander behavior
		this.distance = distance; // the distance the wander sphere is projected in front of the agent
		this.jitter = jitter; // the maximum amount of displacement along the sphere each frame

		this._target = new Vector3$1();

		this._setup();

	}

	_setup () {

		var theta = Math.random() * Math.PI * 2;

		// setup a vector to a target position on the wander sphere
		// target lies always in the XZ plane

		this._target.x = this.radius * Math.cos( theta );
		this._target.z = this.radius * Math.sin( theta );

	}

}

Object.assign( WanderBehavior.prototype, {

	calculate: function () {

		const targetWorldSpace = new Vector3$1();
		const randomDisplacement = new Vector3$1();
		const distanceVector = new Vector3$1();

		return function calculate ( vehicle, force, delta ) {

			// this behavior is dependent on the update rate, so this line must be
			// included when using time independent frame rate

			const jitterThisTimeSlice = this.jitter * delta;

			// prepare random vector

			randomDisplacement.x = _Math$1.randFloat( - 1, 1 ) * jitterThisTimeSlice;
			randomDisplacement.z = _Math$1.randFloat( - 1, 1 ) * jitterThisTimeSlice;

			// add random vector to the target's position

			this._target.add( randomDisplacement );

			// re-project this new vector back onto a unit sphere

			this._target.normalize();

			// increase the length of the vector to the same as the radius of the wander sphere

			this._target.multiplyScalar( this.radius );

			// move the target into a position wanderDist in front of the agent

			distanceVector.z = this.distance;
			targetWorldSpace.addVectors( this._target, distanceVector );

			// project the target into world space

			targetWorldSpace.applyMatrix4( vehicle.matrix );

			// and steer towards it

			force.subVectors( targetWorldSpace, vehicle.position );

		};

	} ()

} );

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class State {

	enter () {}

	execute () {

		console.warn( 'YUKA.State: .execute() must be implemented in derived class.' );

	}

	exit () {}

	onMessage () { return false; }

}

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class StateMachine {

	constructor ( owner ) {

		this.owner = owner; // a reference to the agent that owns this instance
		this.currentState = null; // the current state of the agent
		this.previousState = null; // a reference to the last state the agent was in
		this.globalState = null; // this state logic is called every time the FSM is updated

	}

	update () {

		if ( this.globalState !== null ) {

			this.globalState.execute( this.owner );

		}

		if ( this.currentState !== null ) {

			this.currentState.execute( this.owner );

		}

	}

	changeState ( newState ) {

		if ( newState instanceof State ) {

			this.previousState = this.currentState;

			this.currentState.exit( this.owner );

			this.currentState = newState;

			this.currentState.enter( this.owner );

		} else {

			console.warn( 'YUKA.StateMachine: .changeState() needs a parameter of type "YUKA.State".' );

		}

	}

	revertToPrevoiusState () {

		this.changeState( this.previousState );

	}

	inState ( state ) {

		return ( state === this.currentState );

	}

	handleMessage ( telegram ) {

		// first see, if the current state is valid and that it can handle the message

		if ( this.currentState !== null && this.currentState.onMessage( this.owner, telegram ) === true ) {

			return true;

		}

		// if not, and if a global state has been implemented, send the message to the global state

		if ( this.globalState !== null && this.globalState.onMessage( this.owner, telegram ) === true ) {

			return true;

		}

		return false;

	}

}

exports.EntityManager = EntityManager;
exports.GameEntity = GameEntity;
exports.MovingEntity = MovingEntity;
exports.Path = Path;
exports.Vehicle = Vehicle;
exports.ArriveBehavior = ArriveBehavior;
exports.EvadeBehavior = EvadeBehavior;
exports.FleeBehavior = FleeBehavior;
exports.FollowPathBehavior = FollowPathBehavior;
exports.PursuitBehavior = PursuitBehavior;
exports.SeekBehavior = SeekBehavior;
exports.WanderBehavior = WanderBehavior;
exports.State = State;
exports.StateMachine = StateMachine;
exports._Math = _Math;
exports.Matrix4 = Matrix4;
exports.Quaternion = Quaternion;
exports.Vector3 = Vector3;

Object.defineProperty(exports, '__esModule', { value: true });

})));
