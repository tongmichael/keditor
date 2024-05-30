<template>
	<div class="mindmap-view">
		<div id="mindindoc"></div>
	</div>
</template>


<script>
    import MindElixir, { E } from 'mind-elixir';

    export default {
        name: 'app',
        data() {
            return {
                mind:null,
            	oldData:''
            };
        },
        watch:{

        },
        computed:{
            frameId(){
                return this.$route.params && this.$route.params.frameId || ''
            },
            canEdit(){
                return this.$route.name && this.$route.name.includes('edit')
            }
        },
        methods: {
            getUrlData(){
                let data='';
                if(this.mind){
                    try{
                        let str = this.oldData;
                        for (let i=0;i<str.length;i++){
                            data=data+'-'+str.charCodeAt(i);
                        }
                    }catch (e) {
                        data='';
                        console.log(e);
                    }
                }
                return data;
            },
            getMapData(){
                let data={
                    nodeData: {
                        id: 'root',
                        topic: '根节点',
                        root: true,
                        children:[]
                    },
                    linkData: {},
                };
                try{
                    let params=this.$route.params && this.$route.params.mapData || '';
                    if(params){
                        params=params.replace(/^[\-\%]*/,'');
                        params=params.split(/[\-\%]/);
                        params=String.fromCharCode(...params);
                        data=JSON.parse(params);
                    }
                }catch (e) {
                    console.log(e);
                }
                return data;
            },
            async init(){
                try{
                    this.mind = new MindElixir({
                        el: '#mindindoc',
                        direction: MindElixir.RIGHT,
                        data:this.getMapData(),
                        draggable: this.canEdit,
                        contextMenu: this.canEdit,
                        toolBar: true,
                        nodeMenu: false,
                        keypress: this.canEdit,
                        editable:this.canEdit
                    });
                    this.mind.init();
                    this.mind.bus.addListener('operation', () => {
                        this.dataChange();
                    });
                    this.mind.bus.addListener('unselectNode', () => {
                        this.dataChange();
                    });
                }catch (e) {
                    console.log(e);
                }
            },
            dataChange() {
                let nowData=this.mind.getAllDataString();
                if(this.oldData!==nowData){
                    this.oldData=nowData;
                    window.parent && window.parent.postMessage({frameId:this.frameId,mapData:this.getUrlData()},window.location.protocol+"//"+window.location.host);
                }
            }
        },
        mounted(){
            this.init();
        },
        beforeDestroy(){
        }
    }
</script>

<style lang="scss" scoped>
	.mindmap-view{
		width:100%;
		height:100%;
		position: relative;
		div{
			height:100%;
			overflow: auto;
			overflow: overlay;
		}
	}

</style>
