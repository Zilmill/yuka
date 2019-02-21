/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const CoreJSONs = require( '../../files/CoreJSONs.js' );

const MeshGeometry = YUKA.MeshGeometry;
const AABB = YUKA.AABB;
const BoundingSphere = YUKA.BoundingSphere;
const Ray = YUKA.Ray;
const Vector3 = YUKA.Vector3;
const Matrix4 = YUKA.Matrix4;

describe( 'MeshGeometry', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const geometry = new MeshGeometry();

			expect( geometry ).to.have.a.property( 'vertices' ).that.is.an.instanceof( Float32Array );
			expect( geometry ).to.have.a.property( 'indices' ).that.is.null;
			expect( geometry ).to.have.a.property( 'backfaceCulling' ).that.be.true;
			expect( geometry ).to.have.a.property( 'aabb' ).that.is.an.instanceof( AABB );
			expect( geometry ).to.have.a.property( 'boundingSphere' ).that.is.an.instanceof( BoundingSphere );

		} );

		it( 'should apply the parameters to the new object', function () {

			const vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint16Array( [ 0, 1, 2 ] );

			const geometry = new MeshGeometry( vertices, indices );
			expect( geometry.vertices ).to.equal( vertices );
			expect( geometry.indices ).to.equal( indices );

		} );

	} );

	describe( '#computeBoundingVolume()', function () {

		it( 'should compute the bounding volume for this mesh geometry', function () {

			const geometry = new MeshGeometry();
			geometry.vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			geometry.indices = new Uint16Array( [ 0, 1, 2 ] );

			geometry.computeBoundingVolume();

			expect( geometry.aabb.min ).to.deep.equal( { x: 0, y: 0, z: 0 } );
			expect( geometry.aabb.max ).to.deep.equal( { x: 1, y: 0, z: 1 } );

			expect( geometry.boundingSphere.center ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );
			expect( geometry.boundingSphere.radius ).to.closeTo( 0.7071067811865476, Number.EPSILON );


		} );

	} );

	describe( '#intersectRay()', function () {

		it( 'should perform a ray-triangle intersection test with the given ray and the internal geometry and store the result in the given vector', function () {

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint16Array( [ 0, 1, 2, 3, 4, 5 ] );

			const geometry = new MeshGeometry( vertices, indices );

			const matrix = new Matrix4();
			const intersectionPoint = new Vector3();
			const normal = new Vector3();

			const ray = new Ray( new Vector3( 0.5, 1, 0.5 ), new Vector3( 0, - 1, 0 ) );

			const result = geometry.intersectRay( ray, matrix, intersectionPoint, normal );

			expect( result ).not.to.be.null;
			expect( intersectionPoint ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );
			expect( normal ).to.deep.equal( { x: 0, y: 1, z: 0 } );

		} );

		it( 'should support non-indexed mesh geometries', function () {

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );

			const geometry = new MeshGeometry( vertices );

			const matrix = new Matrix4();
			const intersectionPoint = new Vector3();
			const normal = new Vector3();

			const ray = new Ray( new Vector3( 0.5, 1, 0.5 ), new Vector3( 0, - 1, 0 ) );

			const result = geometry.intersectRay( ray, matrix, intersectionPoint, normal );

			expect( result ).not.to.be.null;
			expect( intersectionPoint ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );
			expect( normal ).to.deep.equal( { x: 0, y: 1, z: 0 } );

		} );

		it( 'should perform an early out if the ray does not intersect the bounding volumes of the obstacle', function () {

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );

			const geometry = new MeshGeometry( vertices );

			const matrix = new Matrix4();
			const intersectionPoint = new Vector3();

			const ray = new Ray( new Vector3( 0.5, 1, 0.5 ), new Vector3( 0, 1, 0 ) );

			expect( geometry.intersectRay( ray, matrix, intersectionPoint ) ).to.be.null;

		} );

		it( 'should respect the transformation of the obstacle', function () {

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );

			const geometry = new MeshGeometry( vertices );

			const ray = new Ray( new Vector3( 0.5, 5, 0.5 ), new Vector3( 0, - 1, 0 ) );

			const matrix = new Matrix4();
			matrix.setPosition( new Vector3( 10, 0, 0 ) );
			const intersectionPoint = new Vector3();

			const result = geometry.intersectRay( ray, matrix, intersectionPoint );

			expect( result ).to.be.null;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint16Array( [ 0, 1, 2 ] );

			const geometry = new MeshGeometry( vertices, indices );

			const json = geometry.toJSON();

			expect( json ).to.be.deep.equal( CoreJSONs.MeshGeometry );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint16Array( [ 0, 1, 2 ] );

			const geometry = new MeshGeometry( vertices, indices );

			const geometry2 = new MeshGeometry().fromJSON( CoreJSONs.MeshGeometry );

			expect( geometry2 ).to.be.deep.equal( geometry );

		} );

		it( 'should deserialize this instance from the given JSON object, test for other branches', function () {

			const vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint32Array( [ 0, 1, 2 ] );

			const geometry = new MeshGeometry( vertices, indices );
			const geometry2 = new MeshGeometry( vertices );

			const geometryJ = new MeshGeometry().fromJSON( geometry.toJSON() );
			const geometryJ2 = new MeshGeometry().fromJSON( geometry2.toJSON() );

			expect( geometryJ ).to.be.deep.equal( geometry );
			expect( geometryJ2 ).to.be.deep.equal( geometry2 );

		} );

	} );

} );
